import { FigmaNode, BlockAnalysis } from '../types.js';
import { 
  DesignToken, 
  TypographyToken, 
  SpacingToken, 
  CTAButton, 
  InteractionLink, 
  HoverState,
  FigmaFill,
  BlockField
} from '../interfaces.js';

export class DesignAnalyzer {
  // Code-derived signal structure
  private parseCodeSignals(rawCode?: string): {
    repeatedContainerNames: Record<string, number>;
    distinctHeadings: string[];
    actionButtonCount: number;
    itemLikeContainerCount: number;
    multiItemLikely: boolean;
    semanticCtas?: { text: string; href?: string; type: 'button' | 'link' }[];
  } {
    if (!rawCode || rawCode.length < 40) {
      return {
        repeatedContainerNames: {},
        distinctHeadings: [],
        actionButtonCount: 0,
        itemLikeContainerCount: 0,
        multiItemLikely: false,
        semanticCtas: [],
      };
    }
    const code = rawCode.toLowerCase();
    const repeatedContainerNames: Record<string, number> = {};
    // Common item container name patterns
    const containerNamePatterns = [
      'accordion item', 'card', 'service item', 'plan card', 'pricing card', 'tab item', 'carousel item', 'gallery item'
    ];
    containerNamePatterns.forEach(p => {
      const regex = new RegExp(p.replace(/ /g, '[\"\'\-\s]*'), 'g');
      const matches = code.match(regex);
      if (matches && matches.length > 0) {
        repeatedContainerNames[p] = matches.length;
      }
    });
    // Headings: collect text inside <h1>-<h6>, and bold div spans that look like headings
  const headingMatches = Array.from(code.matchAll(/<h[1-6][^>]*>(.*?)<\/h[1-6]>|class=["'][^"']*(?:font-bold|text-xl|text-2xl|heading)[^"']*["'][^>]*>(.*?)<\//g));
    const headingTexts: string[] = [];
    headingMatches.forEach(m => {
      const text = (m[1] || m[2] || '').replace(/<[^>]+>/g, '').trim();
      if (text && text.length <= 60) headingTexts.push(text);
    });
    const distinctHeadings = Array.from(new Set(headingTexts));
    // Action buttons: look for buttons/links with action verbs
    const actionKeywords = ['add','edit','remove','delete','view','upgrade','select','choose','learn more','subscribe','sign up'];
    let actionButtonCount = 0;
    actionKeywords.forEach(k => {
      const r = new RegExp(`<button[^>]*>[^<]*${k}[^<]*<|<a[^>]*>[^<]*${k}[^<]*<`, 'g');
      const m = code.match(r);
      if (m) actionButtonCount += m.length;
    });
  // Extract semantic CTAs (<button> and <a href>)
  // NOTE: We intentionally ignore service/product headings here; they are not true interactive CTAs.
    const semanticCtas: { text: string; href?: string; type: 'button' | 'link' }[] = [];
    const buttonMatches = Array.from(code.matchAll(/<button[^>]*>(.*?)<\/button>/g));
    buttonMatches.forEach(m => {
      const text = m[1].replace(/<[^>]+>/g,'').trim();
      if (text) semanticCtas.push({ text, type: 'button' });
    });
  const linkMatches = Array.from(code.matchAll(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/g));
    linkMatches.forEach(m => {
      const href = m[1];
      const text = m[2].replace(/<[^>]+>/g,'').trim();
      if (text) semanticCtas.push({ text, href, type: 'link' });
    });
    // Support exported design buttons rendered as <div data-name="Button">…</div>
    const divButtonMatches = Array.from(rawCode.matchAll(/<div[^>]*data-name=["']button["'][^>]*>([\s\S]*?)<\/div>/gi));
    divButtonMatches.forEach(m => {
      const inner = m[1];
      const textMatch = inner.match(/<p[^>]*>(.*?)<\/p>/i) || inner.match(/<span[^>]*>(.*?)<\/span>/i) || inner.match(/>([^<>]{1,80})</);
      if (textMatch) {
        const rawText = textMatch[1].replace(/<[^>]+>/g,'').trim();
        if (rawText && rawText.length <= 60) {
          semanticCtas.push({ text: rawText, type: 'button' });
        }
      }
    });
    // Filter out service headings masquerading as CTAs
    const serviceKeywordSet = new Set(['internet','tv','voice','mobile','offer','special offer','xfinity home offer']);
    const filteredSemantic = (() => {
      const seen = new Set<string>();
      return semanticCtas.filter(c => {
        const norm = c.text.toLowerCase();
        if (serviceKeywordSet.has(norm)) return false;
        if (seen.has(norm)) return false;
        seen.add(norm);
        return true;
      });
    })();
    // Item-like containers: repeated structural wrappers with data attributes or role patterns
    const itemLikeContainerMatches = code.match(/data-name=("|')(accordion item|card|service item|plan card)("|')/g) || [];
    const itemLikeContainerCount = itemLikeContainerMatches.length;
  // Multi-item likely if we have >1 (>=2) repeated container name occurrences OR >=2 distinct headings paired with >=1 action button OR itemLikeContainerCount >=2
  // Lowering thresholds to increase sensitivity for multi-item detection
  // Threshold rationale: we use >=2 (rather than >=3) for repeated structural containers and candidate frames
  // to catch small sets of items (e.g., 2-card layouts) early. False positives are mitigated by requiring
  // heading/action/button patterns elsewhere in overall heuristics.
  const hasRepeatedContainers = Object.values(repeatedContainerNames).some(c => c >= 2);
  const multiItemLikely = hasRepeatedContainers || (distinctHeadings.length >= 2 && actionButtonCount >= 1) || itemLikeContainerCount >= 2;
    return {
      repeatedContainerNames,
      distinctHeadings,
      actionButtonCount,
      itemLikeContainerCount,
      multiItemLikely,
      semanticCtas: filteredSemantic,
    };
  }
  
  /**
   * Analyze a Figma node to determine block structure
   */
  async analyze(node: FigmaNode, rawCode?: string): Promise<BlockAnalysis> {
    const debugMetrics: Record<string, unknown> = {};
    // Parse code-derived signals first so they can influence block type
    const codeSignals = this.parseCodeSignals(rawCode);
    debugMetrics.codeSignals = codeSignals;
    const blockType = this.determineBlockType(node, debugMetrics, codeSignals);
    const analysis: BlockAnalysis = {
      blockType,
      blockName: this.sanitizeBlockName(node.name),
      contentStructure: {
        containerFields: [],
        itemFields: [],
        configurationOptions: [],
      },
      designTokens: {
        colors: [],
        typography: [],
        spacing: [],
        grid: {
          columns: 12,
          gutter: '24px',
          margin: '120px',
          maxWidth: '1200px',
        },
      },
      interactions: {
        ctaButtons: [],
        links: [],
        hovers: [],
      },
      variants: [],
      accessibility: {
        headingHierarchy: [],
        altTextRequired: false,
        colorContrast: { valid: true },
        keyboardNavigation: true,
      },
      // Embed debug metrics for tooling visibility
      debug: debugMetrics as any,
    };

    // Analyze content structure
    this.analyzeContentStructure(node, analysis);
    
    // Extract design tokens
    this.extractDesignTokens(node, analysis);
    
    // Analyze interactions
    this.analyzeInteractions(node, analysis);
    
    // Check accessibility requirements
    this.analyzeAccessibility(node, analysis);

    return analysis;
  }

  /**
   * Determine if this should be a single block or multi-item block
   */
  private determineBlockType(node: FigmaNode, debugOut?: Record<string, unknown>, codeSignals?: {
    repeatedContainerNames: Record<string, number>;
    distinctHeadings: string[];
    actionButtonCount: number;
    itemLikeContainerCount: number;
    multiItemLikely: boolean;
    semanticCtas?: { text: string; href?: string; type: 'button' | 'link' }[];
  }): 'single' | 'multi-item' {
    console.log(`[DEBUG] determineBlockType starting for node: ${node.name}`);
    
    if (!node.children || node.children.length === 0) {
      console.log(`[DEBUG] No children, returning single`);
      return 'single';
    }

    // EARLY code-signal override if strong multi-item indicators
    if (codeSignals && codeSignals.multiItemLikely) {
      console.log('[DEBUG] Code signals indicate multi-item, overriding before node heuristics');
      if (debugOut) {
        debugOut.reason = 'codeSignalsMultiItem';
        debugOut.codeOverride = true;
      }
      return 'multi-item';
    }

    // COMPREHENSIVE EARLY CHECK: Multiple detection methods for multi-item patterns
    const textNodes = this.findAllTextNodes(node);
    
    // Method 1: Text content with button/CTA keywords
    const buttonTexts = textNodes.filter(textNode => {
      if (!textNode.characters) return false;
      const text = textNode.characters.toLowerCase();
      return text.includes('button') || text.includes('cta') || 
             text.includes('primary cta') || text.includes('secondary cta');
    });
    
    // Method 2: Find nodes with repeating card-like text patterns
    const cardPatternTexts = textNodes.filter(textNode => {
      if (!textNode.characters) return false;
      const text = textNode.characters.toLowerCase();
      return text.includes('card title') || text.includes('caption title') ||
             text.includes('card heading') || text.includes('item') ||
             text.includes('container title') || text.includes('offer');
    });
    
    // Method 2b: Service/Product pattern detection
    const serviceTexts = textNodes.filter(textNode => {
      if (!textNode.characters) return false;
      const text = textNode.characters.toLowerCase();
      const serviceKeywords = [
        'internet', 'tv', 'voice', 'mobile', 'phone', 'cable', 'streaming',
        'service', 'product', 'plan', 'package', 'subscription', 'bundle'
      ];
      return serviceKeywords.some(keyword => text.includes(keyword));
    });
    
    // Method 2c: Action button pattern detection  
    const actionTexts = textNodes.filter(textNode => {
      if (!textNode.characters) return false;
      const text = textNode.characters.toLowerCase();
      const actionKeywords = [
        'add', 'edit', 'remove', 'delete', 'select', 'choose', 'view',
        'learn more', 'get started', 'sign up', 'subscribe', 'upgrade'
      ];
      return actionKeywords.some(keyword => text.includes(keyword));
    });
    
    // Method 2d: Repeated node name patterns (e.g., 'Accordion item', 'Card', 'Service item')
    const nameFrequency: Record<string, number> = {};
    const collectNames = (n: FigmaNode) => {
      if (n.name) {
        const norm = n.name.trim().toLowerCase();
        // Ignore very generic names
        if (norm && norm.length <= 60) {
          nameFrequency[norm] = (nameFrequency[norm] || 0) + 1;
        }
      }
      n.children?.forEach(collectNames);
    };
    collectNames(node);
  // Lower threshold to >=2 occurrences
  const repeatedNames = Object.entries(nameFrequency).filter(([_, count]) => count >= 2);
  // Refined structural container detection based on repeated names
  const repeatedNamedContainers = this.findRepeatedNamedContainers(node);

    // Method 3: Count different button detection methods
  const allButtons = this.findAllButtonNodes(node);
    const alternativeButtons = this.findButtonsAlternativeMethod(node);
    const totalButtons = Math.max(allButtons.length, alternativeButtons.length);
  // If semantic CTAs exist from code, prefer their count for CTA button logic
  const semanticCtaCount = codeSignals?.semanticCtas ? codeSignals.semanticCtas.length : 0;
    
  console.log(`[DEBUG] Detection counts - buttonTexts: ${buttonTexts.length}, cardPatterns: ${cardPatternTexts.length}, serviceTexts: ${serviceTexts.length}, actionTexts: ${actionTexts.length}, repeatedNames: ${repeatedNames.length}, repeatedNamedContainers: ${repeatedNamedContainers.length}, buttons: ${totalButtons}`);
    // EARLY structural forcing: if we have >1 structurally valid repeated named containers (>=2) -> multi-item
    if (repeatedNamedContainers.length >= 2) {
      console.log(`[DEBUG] Repeated named structural containers detected (${repeatedNamedContainers.length}) -> multi-item`);
      return 'multi-item';
    }

  // EXTRA DEBUG: list first few text samples for insight
  const sampleTexts = textNodes.slice(0, 10).map(t => (t.characters || '').replace(/\s+/g,' ').trim().toLowerCase());
  console.log(`[DEBUG] Sample text nodes (first 10): ${JSON.stringify(sampleTexts)}`);
  console.log(`[DEBUG] Total textNodes: ${textNodes.length}`);

    // NEW Heuristic: Raw CTA button extraction (may find more than structural methods)
  const ctaButtons = this.findCTAButtons(node);
    console.log(`[DEBUG] CTA buttons detected (findCTAButtons): ${ctaButtons.length}`);

    // Repeated heading/content pattern map (detect many identical titles suggesting cards)
    const textContentFrequency: Record<string, number> = {};
    textNodes.forEach(t => {
      const chars = (t.characters || '').trim().toLowerCase();
      if (!chars) return;
      // Ignore overly long body paragraphs to focus on titles/labels
      if (chars.length > 60) return;
      textContentFrequency[chars] = (textContentFrequency[chars] || 0) + 1;
    });
    const repeatedKeys = Object.entries(textContentFrequency).filter(([_, count]) => count >= 3);
    console.log(`[DEBUG] repeatedKeys count (>=3 occurrences): ${repeatedKeys.length}`);
  const strongRepetition = repeatedKeys.length >= 1 || (repeatedKeys.length === 1 && repeatedKeys[0][1] >= 2);

    // Refined logic: Button/CTA presence alone should not force multi-item; must pair with structural repetition.
    const structuralSignalsPresent = repeatedNames.length > 0 || this.findCandidateItemContainers(node).length >= 2;
    const effectiveCtaCount = semanticCtaCount > 0 ? semanticCtaCount : ctaButtons.length;
    if (effectiveCtaCount >= 2 && structuralSignalsPresent) {
      console.log(`[DEBUG] CTA button count (${ctaButtons.length}) with structural repetition -> multi-item`);
      if (debugOut) {
        debugOut.reason = 'ctaButtons+structuralSignals';
        debugOut.ctaButtons = effectiveCtaCount;
        debugOut.structuralSignalsPresent = structuralSignalsPresent;
        debugOut.ctaExtraction = semanticCtaCount > 0 ? 'semantic' : 'heuristic';
      }
      return 'multi-item';
    }
    // Force multi-item if strong repetition of short text labels (typical card headings like "Card title")
    if (strongRepetition) {
      console.log(`[DEBUG] Strong repetition of short text labels detected (${repeatedKeys.map(k=>k[0]).join(', ')}) -> multi-item`);
      if (debugOut) {
        debugOut.reason = 'strongTextRepetition';
        debugOut.repeatedKeys = repeatedKeys.map(k=>({text:k[0], count:k[1]}));
      }
      return 'multi-item';
    }

    // Force multi-item if repeated component/frame/group names appear (e.g., many 'Accordion item')
    if (repeatedNames.length >= 1) {
      const primaryRepeated = repeatedNames.find(r => r[1] >= 2);
      if (primaryRepeated) {
        console.log(`[DEBUG] Repeated structural names detected (${primaryRepeated[0]} x${primaryRepeated[1]}) -> multi-item`);
        if (debugOut) {
          debugOut.reason = 'repeatedNames';
          debugOut.repeatedNames = repeatedNames.map(r=>({name:r[0], count:r[1]}));
        }
        return 'multi-item';
      }
    }
    
    // Remove raw total button count forcing. Instead, require pattern texts plus structural repetition.
    if ((buttonTexts.length >= 3 || cardPatternTexts.length >= 2) && structuralSignalsPresent) {
      console.log(`[DEBUG] Pattern texts combined with structural repetition -> multi-item`);
      if (debugOut) {
        debugOut.reason = 'patternTexts+structuralSignals';
        debugOut.buttonTexts = buttonTexts.length;
        debugOut.cardPatternTexts = cardPatternTexts.length;
      }
      return 'multi-item';
    }
    
    // Service/Product card layout detection
    if (serviceTexts.length >= 2 || actionTexts.length >= 2) {
      console.log(`[DEBUG] Service/Product card layout detected (services: ${serviceTexts.length}, actions: ${actionTexts.length}), forcing multi-item`);
      if (debugOut) {
        debugOut.reason = 'serviceOrActionThreshold';
        debugOut.serviceTexts = serviceTexts.length;
        debugOut.actionTexts = actionTexts.length;
        debugOut.ctaExtraction = semanticCtaCount > 0 ? 'semantic' : 'heuristic';
      }
      return 'multi-item';
    }
    
    // Combined service + action pattern (strong indicator for service cards)
    if (serviceTexts.length >= 2 && actionTexts.length >= 1) {
      console.log(`[DEBUG] Combined service+action pattern detected, forcing multi-item`);
      if (debugOut) {
        debugOut.reason = 'combinedServiceAction';
        debugOut.serviceTexts = serviceTexts.length;
        debugOut.actionTexts = actionTexts.length;
        debugOut.ctaExtraction = semanticCtaCount > 0 ? 'semantic' : 'heuristic';
      }
      return 'multi-item';
    }
    
    // Additional check: Many text nodes + repeated content patterns = likely cards
    if (textNodes.length >= 12 && (buttonTexts.length >= 1 || cardPatternTexts.length >= 1 || serviceTexts.length >= 2 || actionTexts.length >= 2)) {
      console.log(`[DEBUG] Many text nodes (${textNodes.length}) with repeated patterns, forcing multi-item`);
      if (debugOut) {
        debugOut.reason = 'manyTextNodes+patterns';
        debugOut.textNodes = textNodes.length;
      }
      return 'multi-item';
    }
    
    // Remove ultra-high button count fallback; rely on structural + repetition signals instead.

    // Repeated heading style detection: count of text nodes with large font sizes
    const headingNodes = textNodes.filter(t => (t.style?.fontSize || 0) >= 32);
    if (headingNodes.length >= 2) {
      console.log(`[DEBUG] Multiple large headings (${headingNodes.length}) detected -> multi-item`);
      if (debugOut) {
        debugOut.reason = 'multipleLargeHeadings';
        debugOut.headingNodes = headingNodes.length;
      }
      return 'multi-item';
    }

    // Structural grid density heuristic
  const gridDensityScore = this.computeGridDensity(node);
    console.log(`[DEBUG] gridDensityScore: ${gridDensityScore}`);
    if (gridDensityScore >= 2) {
      console.log(`[DEBUG] High grid density (${gridDensityScore}) -> multi-item`);
      if (debugOut) {
        debugOut.reason = 'gridDensity';
        debugOut.gridDensityScore = gridDensityScore;
      }
      return 'multi-item';
    }

    // Hierarchical repetition scoring across depth levels
  const repetitionScore = this.computeHierarchicalRepetitionScore(node);
    console.log(`[DEBUG] hierarchical repetition score: ${repetitionScore}`);
    if (repetitionScore >= 2) {
      console.log(`[DEBUG] High hierarchical repetition score (${repetitionScore}) -> multi-item`);
      if (debugOut) {
        debugOut.reason = 'hierarchicalRepetition';
        debugOut.repetitionScore = repetitionScore;
      }
      return 'multi-item';
    }

    // NEW: sibling frame repetition heuristic (e.g., list of accordion items / cards as direct siblings)
    const siblingItemGroups = this.findSiblingItemFrames(node);
    console.log(`[DEBUG] siblingItemGroups: ${siblingItemGroups.length}`);
    if (siblingItemGroups.length >= 2) {
      console.log(`[DEBUG] ≥3 sibling item frames detected -> multi-item`);
      if (debugOut) {
        debugOut.reason = 'siblingItemGroups';
        debugOut.siblingItemGroups = siblingItemGroups.length;
      }
      return 'multi-item';
    }

    // Service heading set heuristic: distinct service/product headings + action indicators
    const distinctServiceHeadings = Array.from(new Set(serviceTexts.map(t => (t.characters || '').toLowerCase())));
    if (distinctServiceHeadings.length >= 2 && (actionTexts.length >= 1 || effectiveCtaCount >= 1)) {
      console.log(`[DEBUG] Distinct service headings (${distinctServiceHeadings.length}) with actions/buttons -> multi-item`);
      if (debugOut) {
        debugOut.reason = 'distinctServiceHeadings';
        debugOut.distinctServiceHeadings = distinctServiceHeadings;
        debugOut.ctaExtraction = semanticCtaCount > 0 ? 'semantic' : 'heuristic';
      }
      return 'multi-item';
    }

    // Structural candidate item container detection (cards/grids)
  const candidateItemContainers = this.findCandidateItemContainers(node);
    console.log(`[DEBUG] candidateItemContainers count: ${candidateItemContainers.length}`);
    if (candidateItemContainers.length >= 2) {
      console.log(`[DEBUG] Multiple candidate item containers (>=3) detected, returning multi-item`);
      if (debugOut) {
        debugOut.reason = 'candidateItemContainers';
        debugOut.candidateItemContainers = candidateItemContainers.length;
      }
      return 'multi-item';
    }

    // Accordion pattern detection
    if (this.isAccordionComponent(node)) {
      console.log('[DEBUG] Accordion pattern detected, returning multi-item');
      if (debugOut) {
        debugOut.reason = 'accordionPattern';
      }
      return 'multi-item';
    }

    // Check for carousel/slider patterns first
    const isCarousel = this.isCarouselComponent(node);
    console.log(`[DEBUG] isCarouselComponent result: ${isCarousel}`);
    if (isCarousel) {
      console.log(`[DEBUG] Carousel detected, returning multi-item`);
      if (debugOut) {
        debugOut.reason = 'carouselPattern';
      }
      return 'multi-item';
    }

    // Re-check combined signal: many buttons + repeated named containers
    console.log(`[DEBUG] Re-check combined button/structure - totalButtons: ${totalButtons}`);
    if (totalButtons >= 3 && repeatedNamedContainers.length >= 2) {
      console.log(`[DEBUG] Many buttons (${totalButtons}) plus repeated named containers (${repeatedNamedContainers.length}) -> multi-item`);
      if (debugOut) {
        debugOut.reason = 'buttons+repeatedNamedContainers';
        debugOut.totalButtons = totalButtons;
        debugOut.repeatedNamedContainers = repeatedNamedContainers.length;
      }
      return 'multi-item';
    }

    // Look for repeating patterns that suggest cards/items
    const potentialItems = this.findRepeatingComponents(node);
    console.log(`[DEBUG] Found ${potentialItems.length} repeating components`);
    
    // If we find multiple similar components, it's likely multi-item
    if (potentialItems.length > 1) {
      console.log(`[DEBUG] Repeating components detected, returning multi-item`);
      if (debugOut) {
        debugOut.reason = 'repeatingComponents';
        debugOut.potentialItems = potentialItems.length;
      }
      return 'multi-item';
    }

    // Check for common multi-item indicators
    const hasContainer = this.findContainerElements(node);
    const hasTitle = this.findTitleElements(node);
    const hasRepeatingContent = this.hasRepeatingContentPattern(node);

    console.log(`[DEBUG] hasContainer: ${hasContainer}, hasTitle: ${hasTitle}, hasRepeatingContent: ${hasRepeatingContent}`);

    if (hasContainer && hasTitle && hasRepeatingContent) {
      console.log(`[DEBUG] Multi-item indicators detected, returning multi-item`);
      if (debugOut) {
        debugOut.reason = 'container+title+repeatingContent';
      }
      return 'multi-item';
    }

    console.log(`[DEBUG] Defaulting to single`);
    if (debugOut) {
      debugOut.buttonTexts = buttonTexts.length;
      debugOut.cardPatternTexts = cardPatternTexts.length;
      debugOut.serviceTexts = serviceTexts.length;
      debugOut.actionTexts = actionTexts.length;
      debugOut.totalButtons = totalButtons;
  debugOut.ctaButtons = effectiveCtaCount;
  debugOut.ctaExtraction = semanticCtaCount > 0 ? 'semantic' : 'heuristic';
      debugOut.repeatedKeys = repeatedKeys.map(r => ({ text: r[0], count: r[1] }));
      debugOut.repeatedNames = repeatedNames.map(r => ({ name: r[0], count: r[1] }));
      debugOut.repeatedNamedContainers = repeatedNamedContainers.map(c => ({ name: c.name, count: c.count }));
      debugOut.headingNodes = headingNodes.length;
      debugOut.gridDensityScore = gridDensityScore;
      debugOut.repetitionScore = repetitionScore;
      debugOut.candidateItemContainers = candidateItemContainers.length;
      debugOut.siblingItemGroups = siblingItemGroups.length;
      if (codeSignals) {
        debugOut.codeSignals = codeSignals;
      }
    }
    return 'single';
  }

  /**
   * Find direct sibling frames/groups/components under any parent that qualify as item frames:
   * Criteria: contain heading-sized text (>=18) AND either an action keyword text OR a detected button.
   * Groups only counted if parent has >=2 such children; returned unique child frames across all parents.
   */
  private findSiblingItemFrames(root: FigmaNode): FigmaNode[] {
    const result: FigmaNode[] = [];
    const parents: FigmaNode[] = [];
    const collectParents = (n: FigmaNode) => {
      if (n.children && n.children.length > 1) parents.push(n);
      n.children?.forEach(collectParents);
    };
    collectParents(root);
    const actionKeywords = ['add','edit','remove','delete','view','learn more','upgrade','select','choose'];
    parents.forEach(parent => {
      const candidates = (parent.children || []).filter(c => ['FRAME','GROUP','COMPONENT'].includes(c.type));
      const qualified = candidates.filter(f => {
        if (!f.children) return false;
        // Heading can appear in any descendant
        const hasHeading = this.findAllTextNodes(f).some(t => (t.style?.fontSize || 0) >= 18);
        const hasActionText = this.findAllTextNodes(f).some(t => {
          const txt = (t.characters || '').toLowerCase();
          return actionKeywords.some(k => txt.includes(k));
        });
        const hasButton = this.findAllButtonNodes(f).length > 0;
        return hasHeading && (hasActionText || hasButton);
      });
      if (qualified.length >= 2) {
        qualified.forEach(q => {
          if (!result.includes(q)) result.push(q);
        });
      }
    });
    return result;
  }

  /**
   * Find repeated named containers that meet structural criteria: heading-sized text and button/action text.
   */
  private findRepeatedNamedContainers(node: FigmaNode): { name: string; count: number }[] {
    interface ContainerInfo { nodes: FigmaNode[]; }
    const map: Record<string, ContainerInfo> = {};
    const isContainerCandidate = (n: FigmaNode): boolean => {
      if (!n.children) return false;
      const hasHeading = n.children.some(c => c.type === 'TEXT' && (c.style?.fontSize || 0) >= 18);
      // Look for a text child with action keywords
      const actionKeywords = ['add','edit','remove','delete','view','learn more','upgrade','select','choose'];
      const hasActionText = this.findAllTextNodes(n).some(t => {
        const txt = (t.characters || '').toLowerCase();
        return actionKeywords.some(k => txt.includes(k));
      });
      // Or presence of a button node
      const hasButton = this.findAllButtonNodes(n).length > 0;
      return hasHeading && (hasActionText || hasButton);
    };
    const traverse = (n: FigmaNode) => {
      if (n.name && (n.type === 'FRAME' || n.type === 'GROUP' || n.type === 'COMPONENT')) {
        const norm = n.name.trim().toLowerCase();
        // Filter out overly generic names to reduce false positives
        const genericNames = ['frame','group','auto layout','container','wrapper'];
        if (genericNames.includes(norm)) {
          n.children?.forEach(traverse);
          return;
        }
        if (isContainerCandidate(n)) {
          if (!map[norm]) map[norm] = { nodes: [] };
          map[norm].nodes.push(n);
        }
      }
      n.children?.forEach(traverse);
    };
    traverse(node);
    return Object.entries(map)
      .filter(([_, info]) => info.nodes.length >= 2)
      .map(([name, info]) => ({ name, count: info.nodes.length }));
  }

  /**
   * Detect frames/groups that look like repeatable item containers (cards, service tiles, etc.)
   * Heuristic: Similar dimensions + contain at least one heading-sized text OR image.
   */
  private findCandidateItemContainers(node: FigmaNode): FigmaNode[] {
    const containers: FigmaNode[] = [];
    const collect = (n: FigmaNode) => {
      if ((n.type === 'FRAME' || n.type === 'GROUP' || n.type === 'COMPONENT') && n.children && n.children.length > 0) {
        const hasHeadingText = n.children.some(c => c.type === 'TEXT' && c.style?.fontSize && c.style.fontSize >= 18);
        const hasImage = this.findAllImageNodes(n).length > 0;
        const hasButton = this.findAllButtonNodes(n).length > 0;
        if (hasHeadingText || hasImage || hasButton) {
          containers.push(n);
        }
      }
      n.children?.forEach(collect);
    };
    collect(node);

    // Group by size signature and keep groups of size >=2
    const bySignature: Record<string, FigmaNode[]> = {};
    containers.forEach(c => {
      const bounds = c.absoluteBoundingBox;
      const sig = bounds ? `${Math.round(bounds.width)}x${Math.round(bounds.height)}` : 'nosize';
      bySignature[sig] = bySignature[sig] || [];
      bySignature[sig].push(c);
    });
    const repeating = Object.values(bySignature).filter(g => g.length >= 2).flat();
    return repeating;
  }

  /**
   * Detect basic accordion structures: repeated headers followed by content regions.
   * Looks for frames/groups with a header-like text node and sibling content container.
   */
  private isAccordionComponent(node: FigmaNode): boolean {
    const sections: { header: FigmaNode; container: FigmaNode }[] = [];
    const traverse = (n: FigmaNode) => {
      if ((n.type === 'FRAME' || n.type === 'GROUP') && n.children && n.children.length >= 2) {
        // header candidate: text with medium+ font size or name containing 'header'/'accordion'
        const header = n.children.find(c => (
          c.type === 'TEXT' && c.style?.fontSize && c.style.fontSize >= 18
        ) || (c.name && /header|accordion|title/i.test(c.name)));
        // content candidate: frame/group following header
        const container = header ? n.children.find(c => c !== header && (c.type === 'FRAME' || c.type === 'GROUP')) : undefined;
        if (header && container) {
          sections.push({ header, container });
        }
      }
      n.children?.forEach(traverse);
    };
    traverse(node);
    if (sections.length >= 3) {
      console.log(`[DEBUG] Accordion sections detected: ${sections.length}`);
      return true;
    }
    return false;
  }

  /**
   * Analyze the content structure to determine fields
   */
  private analyzeContentStructure(node: FigmaNode, analysis: BlockAnalysis): void {
    const textNodes = this.findAllTextNodes(node);
    const imageNodes = this.findAllImageNodes(node);
    const buttonNodes = this.findAllButtonNodes(node);

    if (analysis.blockType === 'multi-item') {
      // For multi-item blocks, separate container and item fields
      
      // Container fields (typically the main heading)
      const mainHeading = this.findMainHeading(textNodes);
      if (mainHeading) {
        analysis.contentStructure.containerFields.push({
          name: 'heading',
          label: 'Container Heading',
          component: 'text',
          valueType: 'string',
          required: true,
          maxLength: 200,
          description: 'Main heading displayed above the items',
        });
      }

      // Item fields (content that repeats for each item)
      const itemStructure = this.analyzeItemStructure(node);
      analysis.contentStructure.itemFields = itemStructure.fields;
      
    } else {
      // For single blocks, all fields are container fields
      analysis.contentStructure.containerFields = this.extractAllFields(textNodes, imageNodes, buttonNodes);
    }

    // Configuration options (themes, variants, etc.)
    analysis.contentStructure.configurationOptions = this.findConfigurationOptions(node);
  }

  /**
   * Extract design tokens from the Figma node
   */
  private extractDesignTokens(node: FigmaNode, analysis: BlockAnalysis): void {
    // Extract colors
    analysis.designTokens.colors = this.extractColors(node);
    
    // Extract typography
    analysis.designTokens.typography = this.extractTypography(node);
    
    // Extract spacing
    analysis.designTokens.spacing = this.extractSpacing(node);
  }

  /**
   * Analyze interactive elements
   */
  private analyzeInteractions(node: FigmaNode, analysis: BlockAnalysis): void {
    // Prefer semantic CTAs derived from code signals if available
    const debugAny: any = analysis.debug as any;
    const semanticCtas = debugAny?.codeSignals?.semanticCtas as { text: string; href?: string; type: 'button' | 'link' }[] | undefined;
    const serviceKeywordSet = new Set(['internet','tv','voice','mobile','offer','special offer','xfinity home offer']);
    let ctas: CTAButton[] = [];
    const rawCodePresent = !!debugAny?.rawCodePresent;
    if (semanticCtas && semanticCtas.length > 0) {
      // Deduplicate by text
      const seen = new Set<string>();
      const deduped = semanticCtas.filter(c => {
        const norm = c.text.trim().toLowerCase();
        if (!norm || seen.has(norm)) return false;
        seen.add(norm);
        return true;
      }).filter(c => !serviceKeywordSet.has(c.text.toLowerCase()));
      // Map first two to primary/secondary, remainder tertiary until cap 3
      const limited = deduped.slice(0, 3);
      ctas = limited.map((c, i) => ({
        text: c.text,
        type: (i === 0 ? 'primary' : (i === 1 ? 'secondary' : 'secondary')) as 'primary' | 'secondary',
        url: c.href || '#'
      }));
      debugAny.ctaExtraction = 'semantic';
    } else {
      // Heuristic fallback
      const heuristic = this.findCTAButtons(node);
      // Filter out service headings mis-detected as buttons
      const filtered = heuristic.filter(h => !serviceKeywordSet.has(h.text.toLowerCase()));
      // Deduplicate by text and cap at 3
      const seen = new Set<string>();
      ctas = filtered.filter(c => {
        const norm = c.text.toLowerCase();
        if (seen.has(norm)) return false;
        seen.add(norm);
        return true;
      }).slice(0, 3).map((c, i) => ({
        text: c.text,
        type: (i === 0 ? 'primary' : 'secondary'),
        url: c.url
      }));
      // Additional pruning if rawCode missing: keep only action keyword CTAs
      if (!rawCodePresent) {
        const actionKeywords = ['add','edit','remove','delete','view','upgrade','select','choose','learn more','subscribe','sign up'];
        const pruned = ctas.filter(c => actionKeywords.some(k => c.text.toLowerCase().includes(k)));
        if (pruned.length > 0) {
          ctas = pruned.slice(0, 3);
          debugAny.ctaPrunedForNoRawCode = true;
          debugAny.ctaPrunedCount = pruned.length;
        }
      }
      debugAny.ctaExtraction = 'heuristic';
    }
    analysis.interactions.ctaButtons = ctas;

    // Links & hovers unchanged for now
    analysis.interactions.links = this.findLinks(node);
    analysis.interactions.hovers = this.findHoverStates(node);
  }

  /**
   * Analyze accessibility requirements
   */
  private analyzeAccessibility(node: FigmaNode, analysis: BlockAnalysis): void {
    // Determine heading hierarchy
    analysis.accessibility.headingHierarchy = this.determineHeadingHierarchy(node);
    
    // Check if images require alt text
    analysis.accessibility.altTextRequired = this.findAllImageNodes(node).length > 0;
    
    // Basic color contrast check (simplified)
    analysis.accessibility.colorContrast = this.checkColorContrast(node);
  }

  // Helper methods
  
  private sanitizeBlockName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private findAllTextNodes(node: FigmaNode): FigmaNode[] {
    const textNodes: FigmaNode[] = [];
    
    const traverse = (n: FigmaNode) => {
      if (n.type === 'TEXT') {
        textNodes.push(n);
      }
      if (n.children) {
        n.children.forEach(traverse);
      }
    };
    
    traverse(node);
    return textNodes;
  }

  private findAllImageNodes(node: FigmaNode): FigmaNode[] {
    const imageNodes: FigmaNode[] = [];
    
    const traverse = (n: FigmaNode) => {
      if (n.type === 'RECTANGLE' && n.fills && n.fills.some((fill: FigmaFill) => fill.type === 'IMAGE')) {
        imageNodes.push(n);
      }
      if (n.children) {
        n.children.forEach(traverse);
      }
    };
    
    traverse(node);
    return imageNodes;
  }

  private findAllButtonNodes(node: FigmaNode): FigmaNode[] {
    const buttonNodes: FigmaNode[] = [];
    const actionKeywords = ['add','edit','remove','delete','view','upgrade','select','choose','learn more','subscribe','sign up'];
    const serviceKeywords = ['internet','tv','voice','mobile','offer','special offer','xfinity home offer'];
    
    const traverse = (n: FigmaNode) => {
      // Look for common button patterns
      const lname = n.name?.toLowerCase() || '';
      const nameCheck = lname.includes('button') || lname.includes('cta');
      // Frame is considered a button only if it has a text child containing an action keyword (avoid service headings)
      const frameCheck = (n.type === 'FRAME' || n.type === 'GROUP' || n.type === 'COMPONENT') && n.backgroundColor && this.hasTextChild(n) &&
        this.findAllTextNodes(n).some(t => {
          const txt = (t.characters || '').toLowerCase();
          return actionKeywords.some(k => txt.includes(k)) && !serviceKeywords.includes(txt);
        });
      
      if (nameCheck || frameCheck) {
        buttonNodes.push(n);
        console.log(`[DEBUG] findAllButtonNodes found: ${n.name} (type: ${n.type}, nameCheck: ${nameCheck}, frameCheck: ${frameCheck})`);
      }
      if (n.children) {
        n.children.forEach(traverse);
      }
    };
    
    traverse(node);
    console.log(`[DEBUG] findAllButtonNodes total: ${buttonNodes.length}`);
    return buttonNodes;
  }

  private hasTextChild(node: FigmaNode): boolean {
    if (node.type === 'TEXT') return true;
    if (!node.children) return false;
    return node.children.some(child => this.hasTextChild(child));
  }

  private findRepeatingComponents(node: FigmaNode): FigmaNode[] {
    if (!node.children) return [];
    
    // Group children by similar structure/size
    const groups: { [key: string]: FigmaNode[] } = {};
    
    node.children.forEach(child => {
      const signature = this.getNodeSignature(child);
      if (!groups[signature]) {
        groups[signature] = [];
      }
      groups[signature].push(child);
    });
    
    // Return groups with more than one item
    return Object.values(groups).filter(group => group.length > 1).flat();
  }

  /**
   * Compute a simple grid density score: count of sibling frames/groups/components with similar heights
   * and aligned roughly in a row or column. Higher counts imply a multi-item grid layout.
   */
  private computeGridDensity(node: FigmaNode): number {
    if (!node.children) return 0;
    const candidates = node.children.filter(c => ['FRAME','GROUP','COMPONENT'].includes(c.type));
    interface Dim { h: number; w: number; x: number; y: number; node: FigmaNode }
    const dims: Dim[] = candidates.map(c => ({
      h: Math.round(c.absoluteBoundingBox?.height || 0),
      w: Math.round(c.absoluteBoundingBox?.width || 0),
      x: Math.round(c.absoluteBoundingBox?.x || 0),
      y: Math.round(c.absoluteBoundingBox?.y || 0),
      node: c
    })).filter(d => d.h > 0 && d.w > 0);
    if (dims.length < 2) return 0;
    // Group by approx height similarity (within 10px)
    const groups: Dim[][] = [];
    dims.forEach(d => {
      let group = groups.find(g => Math.abs(g[0].h - d.h) <= 10);
      if (!group) { group = [d]; groups.push(group); }
      else group.push(d);
    });
    // Score: largest group size adjusted by average horizontal or vertical alignment pattern
    let score = 0;
    groups.forEach(g => {
      if (g.length < 2) return;
      // Determine if mostly in a row (y within 20px) or a column (x within 20px)
      const rowAligned = g.filter(d => Math.abs(d.y - g[0].y) <= 20).length;
      const colAligned = g.filter(d => Math.abs(d.x - g[0].x) <= 20).length;
      const alignmentFactor = Math.max(rowAligned, colAligned);
      score = Math.max(score, alignmentFactor);
    });
    return score;
  }

  /**
   * Compute hierarchical repetition score by traversing all descendants and counting repeating signatures.
   * Score increments for each signature group beyond first occurrence; deeper levels add slight weight.
   */
  private computeHierarchicalRepetitionScore(node: FigmaNode): number {
    let score = 0;
    const signatureMap: Record<string, number> = {};
    const traverse = (n: FigmaNode, depth: number) => {
      const sig = this.getNodeSignature(n);
      signatureMap[sig] = (signatureMap[sig] || 0) + 1;
      if (signatureMap[sig] > 1) {
        // Add depth-weighted increment (deeper repetition counts slightly more)
        score += 1 + Math.min(depth, 3) * 0.25;
      }
      n.children?.forEach(c => traverse(c, depth + 1));
    };
    traverse(node, 0);
    return Math.round(score);
  }

  private getNodeSignature(node: FigmaNode): string {
    // Create a signature based on node structure
    const bounds = node.absoluteBoundingBox;
    const width = bounds ? Math.round(bounds.width / 10) * 10 : 0;
    const height = bounds ? Math.round(bounds.height / 10) * 10 : 0;
    const childCount = node.children?.length || 0;
    
    return `${node.type}-${width}x${height}-${childCount}`;
  }

  private findContainerElements(node: FigmaNode): boolean {
    // Look for elements that suggest this is a container
    return node.name?.toLowerCase().includes('container') || 
           node.name?.toLowerCase().includes('wrapper') ||
           node.type === 'FRAME';
  }

  private findTitleElements(node: FigmaNode): boolean {
    const textNodes = this.findAllTextNodes(node);
    return textNodes.some(n => 
      n.name?.toLowerCase().includes('title') ||
      n.name?.toLowerCase().includes('heading') ||
      (n.style && n.style.fontSize && n.style.fontSize > 32)
    );
  }

  private hasRepeatingContentPattern(node: FigmaNode): boolean {
    return this.findRepeatingComponents(node).length > 0;
  }

  /**
   * Check if this node represents a carousel/slider component
   */
  private isCarouselComponent(node: FigmaNode): boolean {
    // Check component name for carousel indicators
    const name = node.name?.toLowerCase() || '';
    const carouselKeywords = ['carousel', 'slider', 'slides', 'gallery', 'slideshow'];
    
    if (carouselKeywords.some(keyword => name.includes(keyword))) {
      return true;
    }

    // Look for navigation elements (arrows, prev/next buttons)
    const hasNavigation = this.hasNavigationControls(node);
    
    // Look for page indicators (dots, progress indicators)
    const hasPageIndicators = this.hasPageIndicators(node);
    
    // Look for slide container patterns
    const hasSlideStructure = this.hasSlideStructure(node);

    // Check for high number of buttons (indicates multiple slides)
    const allButtons = this.findAllButtonNodes(node);
    const hasManyCTAs = allButtons.length >= 5;

    // If we have navigation OR page indicators OR slide structure OR many CTAs, it's likely a carousel
    return hasNavigation || hasPageIndicators || hasSlideStructure || hasManyCTAs;
  }

  /**
   * Check for navigation controls (arrows, prev/next buttons)
   */
  private hasNavigationControls(node: FigmaNode): boolean {
    return this.traverseNodeTree(node, (n) => {
      const name = n.name?.toLowerCase() || '';
      const navigationKeywords = [
        'arrow', 'prev', 'next', 'previous', 'forward', 'back',
        'chevron', 'nav', 'button', 'control', 'action'
      ];
      
      // Check if name contains navigation keywords
      const hasNavKeyword = navigationKeywords.some(keyword => name.includes(keyword));
      
      // Check for common arrow/button patterns
      const isArrowShape = name.includes('arrow') || name.includes('chevron');
      const isNavButton = name.includes('button') && (name.includes('prev') || name.includes('next'));
      const isActionButton = name.includes('action') && name.includes('button');
      
      // Check for circular/round buttons that are typically navigation
      const isRoundButton = (name.includes('ellipse') || name.includes('circle')) && 
                           (n.type === 'ELLIPSE' || name.includes('button'));
      
      return hasNavKeyword || isArrowShape || isNavButton || isActionButton || isRoundButton;
    });
  }

  /**
   * Check for page indicators (dots, progress indicators)
   */
  private hasPageIndicators(node: FigmaNode): boolean {
    return this.traverseNodeTree(node, (n) => {
      const name = n.name?.toLowerCase() || '';
      const indicatorKeywords = [
        'indicator', 'dot', 'dots', 'progress', 'pagination', 'pager',
        'stepper', 'counter', 'bullet', 'marker'
      ];
      
      return indicatorKeywords.some(keyword => name.includes(keyword));
    });
  }

  /**
   * Check for slide container structure
   */
  private hasSlideStructure(node: FigmaNode): boolean {
    if (!node.children) return false;

    // Look for multiple similar containers that could be slides
    const containers = node.children.filter(child => 
      child.type === 'FRAME' || child.type === 'GROUP'
    );

    if (containers.length < 2) return false;

    // Check if containers have similar content structure
    return containers.some(container => {
      const hasContent = this.hasTextChild(container);
      const hasImages = this.findAllImageNodes(container).length > 0;
      const hasButtons = this.findAllButtonNodes(container).length > 0;
      
      // A slide typically has text content and may have images/buttons
      return hasContent && (hasImages || hasButtons);
    });
  }

  /**
   * Traverse the node tree and check if any node matches the condition
   */
  private traverseNodeTree(node: FigmaNode, condition: (n: FigmaNode) => boolean): boolean {
    if (condition(node)) {
      return true;
    }
    
    if (node.children) {
      return node.children.some(child => this.traverseNodeTree(child, condition));
    }
    
    return false;
  }

  private findMainHeading(textNodes: FigmaNode[]): FigmaNode | null {
    // Find the largest text node, likely the main heading
    return textNodes.reduce((largest, node) => {
      const currentSize = node.style?.fontSize || 0;
      const largestSize = largest?.style?.fontSize || 0;
      return currentSize > largestSize ? node : largest;
    }, null as FigmaNode | null);
  }

  private analyzeItemStructure(node: FigmaNode): { fields: BlockField[] } {
    // Simplified item structure analysis
    const fields = [];
    
    // Common card patterns
    fields.push({
      name: 'cardHeading',
      label: 'Card Heading',
      component: 'text',
      valueType: 'string',
      required: true,
      maxLength: 100,
      description: 'Heading for individual card',
    });
    
    fields.push({
      name: 'cardBody',
      label: 'Card Body Text',
      component: 'richtext',
      valueType: 'string',
      required: true,
      maxLength: 500,
      description: 'Main content text for the card',
    });
    
    // Check for buttons/CTAs
    // Limit CTA fields to at most 3 (primary, secondary, tertiary)
    const heuristicButtons = this.findCTAButtons(node);
    const selectedButtons = heuristicButtons.slice(0, 3);
    const suffixMap = ['Primary','Secondary','Tertiary'];
    selectedButtons.forEach((button, index) => {
      const suffix = suffixMap[index];
      const ctaName = `${suffix.toLowerCase()}Cta`;
      const ctaTextName = `${suffix.toLowerCase()}CtaText`;
      fields.push({
        name: ctaName,
        label: `${suffix} CTA URL`,
        component: 'text',
        valueType: 'string',
        required: false,
        description: `URL for the ${suffix.toLowerCase()} call-to-action button`,
      });
      fields.push({
        name: ctaTextName,
        label: `${suffix} CTA Text`,
        component: 'text',
        valueType: 'string',
        required: false,
        maxLength: 50,
        description: `Display text for the ${suffix.toLowerCase()} CTA button`,
      });
    });
    
    return { fields };
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private extractAllFields(textNodes: FigmaNode[], imageNodes: FigmaNode[], _buttonNodes: FigmaNode[]): BlockField[] {
    // For single blocks, create fields for all content
    const fields: BlockField[] = [];
    
    // Add text fields
    textNodes.forEach((node, index) => {
      const isHeading = node.style?.fontSize && node.style.fontSize > 24;
      fields.push({
        name: isHeading ? `heading${index || ''}` : `text${index || ''}`,
        label: isHeading ? `Heading ${index + 1}` : `Text ${index + 1}`,
        component: isHeading ? 'text' : 'richtext',
        valueType: 'string',
        required: true,
      });
    });
    
    // Add image fields
    imageNodes.forEach((node, index) => {
      fields.push({
        name: `image${index || ''}`,
        label: `Image ${index + 1}`,
        component: 'reference',
        valueType: 'string',
        required: false,
      });
    });
    
    return fields;
  }

  private findConfigurationOptions(node: FigmaNode): string[] {
    // Look for common configuration patterns
    const options = ['light', 'dark'];
    
    // Check node name for variants
    if (node.name?.toLowerCase().includes('compact')) {
      options.push('compact');
    }
    
    if (node.name?.toLowerCase().includes('centered')) {
      options.push('centered');
    }
    
    return options;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private extractColors(_node: FigmaNode): DesignToken[] {
    // Extract color tokens from the design
    const colors = [];
    
    // Default EDS colors based on common patterns
    colors.push({
      figmaToken: 'Text/Primary',
      cssVariable: '--text-primary',
      value: '#0d0d0c',
      context: 'text' as const,
    });
    
    colors.push({
      figmaToken: 'Button/Primary',
      cssVariable: '--button-primary',
      value: '#769bcd',
      context: 'button' as const,
    });
    
    colors.push({
      figmaToken: 'Surface/White',
      cssVariable: '--surface-white',
      value: '#ffffff',
      context: 'background' as const,
    });
    
    return colors;
  }

  private extractTypography(node: FigmaNode): TypographyToken[] {
    const typography: TypographyToken[] = [];
    const textNodes = this.findAllTextNodes(node);
    
    textNodes.forEach(textNode => {
      if (textNode.style) {
        const fontSize = textNode.style.fontSize || 16;
        const lineHeight = textNode.style.lineHeightPx || Math.round(fontSize * 1.5);
        
        let cssVariable = '--body-font-size-m';
        let figmaToken = 'Typography/Body/M';
        
        if (fontSize >= 48) {
          cssVariable = '--heading-font-size-xl';
          figmaToken = 'Typography/Heading/XL';
        } else if (fontSize >= 32) {
          cssVariable = '--heading-font-size-l';
          figmaToken = 'Typography/Heading/L';
        } else if (fontSize >= 24) {
          cssVariable = '--heading-font-size-m';
          figmaToken = 'Typography/Heading/M';
        }
        
        typography.push({
          figmaToken,
          cssVariable,
          fontSize: `${fontSize}px`,
          lineHeight: `${lineHeight}px`,
          fontWeight: `${textNode.style.fontWeight || 400}`,
          fontFamily: textNode.style.fontFamily || 'Roboto',
        });
      }
    });
    
    return typography;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private extractSpacing(_node: FigmaNode): SpacingToken[] {
    // Extract spacing patterns
    return [
      {
        figmaToken: 'Spacing/L',
        cssVariable: '--spacing-l',
        value: '32px',
        usage: 'padding' as const,
      },
      {
        figmaToken: 'Spacing/M',
        cssVariable: '--spacing-m',
        value: '24px',
        usage: 'gap' as const,
      },
    ];
  }

  private findCTAButtons(node: FigmaNode): CTAButton[] {
    // Try alternative button detection method
    const alternativeButtons = this.findButtonsAlternativeMethod(node);
    
    const buttons = this.findAllButtonNodes(node);
    console.log(`[DEBUG] findCTAButtons called findAllButtonNodes, got: ${buttons.length}`);
    console.log(`[DEBUG] Alternative method found: ${alternativeButtons.length}`);
    
    // Use alternative method if main method finds nothing
    const finalButtons = buttons.length > 0 ? buttons : alternativeButtons;
    
    const ctaButtons = finalButtons.map((button, index) => ({
      text: this.extractButtonText(button) || `CTA ${index + 1}`,
      type: (index === 0 ? 'primary' : 'secondary') as 'primary' | 'secondary',
      url: '#',
    }));
    
    console.log(`[DEBUG] findCTAButtons returning: ${ctaButtons.length} CTAs`);
    return ctaButtons;
  }

  /**
   * Alternative button detection method that looks for any node with button-like text
   */
  private findButtonsAlternativeMethod(node: FigmaNode): FigmaNode[] {
    const buttonNodes: FigmaNode[] = [];
    
    const traverse = (n: FigmaNode) => {
      // Look for any frame/group that contains button-like text
      if (n.type === 'FRAME' || n.type === 'GROUP' || n.type === 'COMPONENT') {
        const hasButtonLikeText = this.containsButtonLikeText(n);
        if (hasButtonLikeText) {
          buttonNodes.push(n);
        }
      }
      
      if (n.children) {
        n.children.forEach(traverse);
      }
    };
    
    traverse(node);
    return buttonNodes;
  }

  /**
   * Check if a node contains button-like text content
   */
  private containsButtonLikeText(node: FigmaNode): boolean {
    const textNodes = this.findAllTextNodes(node);
    const actionKeywords = ['add','edit','remove','delete','view','upgrade','select','choose','learn more','subscribe','sign up'];
    const serviceKeywords = ['internet','tv','voice','mobile','offer','special offer','xfinity home offer'];
    return textNodes.some(textNode => {
      if (!textNode.characters) return false;
      const text = textNode.characters.toLowerCase();
      // Exclude pure service headings
      if (serviceKeywords.includes(text)) return false;
      // Must include at least one action keyword or explicit button label
      const buttonTexts = ['button','cta','click'];
      return actionKeywords.some(k => text.includes(k)) || buttonTexts.some(bt => text.includes(bt));
    });
  }

  private extractButtonText(node: FigmaNode): string | null {
    const textNodes = this.findAllTextNodes(node);
    return textNodes[0]?.characters || null;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private findLinks(_node: FigmaNode): InteractionLink[] {
    // Find links that aren't buttons
    return [];
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private findHoverStates(_node: FigmaNode): HoverState[] {
    // Analyze hover states if available
    return [];
  }

  private determineHeadingHierarchy(node: FigmaNode): string[] {
    const textNodes = this.findAllTextNodes(node);
    const headings = textNodes
      .filter(n => n.style?.fontSize && n.style.fontSize > 24)
      .sort((a, b) => (b.style?.fontSize || 0) - (a.style?.fontSize || 0))
      .map((n, index) => `h${index + 1}`);
      
    return headings.slice(0, 6); // Max 6 heading levels
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private checkColorContrast(_node: FigmaNode): { valid: boolean; ratio?: number } {
    // Simplified color contrast check
    return { valid: true };
  }
}