import axios, { AxiosInstance } from 'axios';
import { FigmaNode, FigmaAPIError } from '../types.js';
import { FigmaClientInterface, FigmaFileResponse, FigmaVariablesResponse } from '../interfaces.js';

export class FigmaClient implements FigmaClientInterface {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.FIGMA_ACCESS_TOKEN || null;
    
    this.client = axios.create({
      baseURL: 'https://api.figma.com/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers['X-Figma-Token'] = this.accessToken;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new FigmaAPIError(
            `Figma API error: ${error.response.data?.message || error.message}`,
            error.response.status
          );
        }
        throw new FigmaAPIError(`Network error: ${error.message}`);
      }
    );
  }

  /**
   * Get a specific node from a Figma file
   */
  async getNode(fileKey: string, nodeId: string, accessToken?: string): Promise<FigmaNode> {
    if (accessToken) {
      this.accessToken = accessToken;
    }

    if (!this.accessToken) {
      throw new FigmaAPIError('Figma access token is required');
    }

    try {
      const response = await this.client.get(`/files/${fileKey}/nodes`, {
        params: {
          ids: nodeId,
        },
      });

      const nodeData = response.data.nodes[nodeId];
      if (!nodeData) {
        throw new FigmaAPIError(`Node ${nodeId} not found in file ${fileKey}`);
      }

      return nodeData.document;
    } catch (error) {
      if (error instanceof FigmaAPIError) {
        throw error;
      }
      throw new FigmaAPIError(`Failed to fetch node: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file information including all pages and top-level nodes
   */
  async getFile(fileKey: string, accessToken?: string): Promise<FigmaFileResponse> {
    if (accessToken) {
      this.accessToken = accessToken;
    }

    if (!this.accessToken) {
      throw new FigmaAPIError('Figma access token is required');
    }

    try {
      const response = await this.client.get(`/files/${fileKey}`);
      return response.data as FigmaFileResponse;
    } catch (error) {
      if (error instanceof FigmaAPIError) {
        throw error;
      }
      throw new FigmaAPIError(`Failed to fetch file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get images for specific nodes
   */
  async getImages(fileKey: string, nodeIds: string[], options: {
    format?: 'jpg' | 'png' | 'svg' | 'pdf';
    scale?: number;
    accessToken?: string;
  } = {}): Promise<Record<string, string>> {
    if (options.accessToken) {
      this.accessToken = options.accessToken;
    }

    if (!this.accessToken) {
      throw new FigmaAPIError('Figma access token is required');
    }

    try {
      const response = await this.client.get(`/images/${fileKey}`, {
        params: {
          ids: nodeIds.join(','),
          format: options.format || 'png',
          scale: options.scale || 2,
        },
      });

      return response.data.images;
    } catch (error) {
      if (error instanceof FigmaAPIError) {
        throw error;
      }
      throw new FigmaAPIError(`Failed to fetch images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get local variables from a file (design tokens)
   */
  async getLocalVariables(fileKey: string, accessToken?: string): Promise<FigmaVariablesResponse> {
    if (accessToken) {
      this.accessToken = accessToken;
    }

    if (!this.accessToken) {
      throw new FigmaAPIError('Figma access token is required');
    }

    try {
      const response = await this.client.get(`/files/${fileKey}/variables/local`);
      return response.data as FigmaVariablesResponse;
    } catch (error) {
      if (error instanceof FigmaAPIError) {
        throw error;
      }
      throw new FigmaAPIError(`Failed to fetch variables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get published variables from a file
   */
  async getPublishedVariables(fileKey: string, accessToken?: string): Promise<FigmaVariablesResponse> {
    if (accessToken) {
      this.accessToken = accessToken;
    }

    if (!this.accessToken) {
      throw new FigmaAPIError('Figma access token is required');
    }

    try {
      const response = await this.client.get(`/files/${fileKey}/variables/published`);
      return response.data as FigmaVariablesResponse;
    } catch (error) {
      if (error instanceof FigmaAPIError) {
        throw error;
      }
      throw new FigmaAPIError(
        `Failed to fetch published variables: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse a Figma URL to extract file key and node ID
   */
  static parseUrl(url: string): { fileKey: string; nodeId?: string } | null {
    const patterns = [
      // Standard Figma file URL with node ID
      /figma\.com\/design\/([^/?]+)\/[^?]*\?[^#]*node-id=([^&]+)/,
      // Standard Figma file URL with node ID (alternative format)
      /figma\.com\/file\/([^/?]+)\/[^?]*\?[^#]*node-id=([^&]+)/,
      // File URL without node ID
      /figma\.com\/(?:design|file)\/([^/?]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const fileKey = match[1];
        const nodeId = match[2]?.replace(/-/g, ':'); // Convert URL format to API format
        return { fileKey, nodeId };
      }
    }

    return null;
  }
}