# EY EDS XWalk Adobe Code Kit
The EY EDS XWalk Adobe Code Kit for nis is an accelerator that transforms the EY Figma Design Kit into production-ready Adobe Edge Delivery Services (EDS) XWalk blocks. It bridges design and delivery by standardizing the process of converting EY-branded Figma components into semantic HTML, responsive CSS, and lightweight JavaScript, paired with Universal Editor models for authoring. This kit streamlines collaboration between designers and developers, ensures brand consistency across multi-tenant AEM projects, and accelerates the deployment of reusable, accessible, and performance-optimized blocks into EY client solutions.

## Environments
- Preview: https://main--nis-kit--oherns321.aem.page/
- Live: https://main--nis-kit--oherns321.aem.live/

## Documentation

To set up your site, we recommand you to go through the documentation on [www.aem.live](https://www.aem.live/docs/) and * (https://www.aem.live/developer/ue-tutorial). 

Additional materials available at: [experienceleague.adobe.com](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/authoring), more specifically:
1. [Getting Started](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/edge-dev-getting-started), [Creating Blocks](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/create-block), [Content Modelling](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/content-modeling)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

Furthremore, we encourage you to watch the recordings of any of our previous presentations or sessions:
- [Getting started with AEM Authoring and Edge Delivery Services](https://experienceleague.adobe.com/en/docs/events/experience-manager-gems-recordings/gems2024/aem-authoring-and-edge-delivery)

## Prerequisites

- nodejs 18.3.x or newer
- AEM Cloud Service release 2024.8 or newer (>= `17465`)

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `nis-kit` directory in your favorite IDE and start coding :)
