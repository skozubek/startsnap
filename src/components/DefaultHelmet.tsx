/**
 * src/components/DefaultHelmet.tsx
 * @description Provides site-wide default SEO meta tags for pages that do not supply their own Helmet configuration (e.g., landing page, 404).
 */

import { Helmet } from "react-helmet-async";
import { SITE_URL, DEFAULT_OG_IMAGE } from "../config/site";

/**
 * @description Renders the default set of meta tags shared by the homepage and any routes
 *              that don't override them. Should be mounted high in the component tree so
 *              that more specific pages can override individual tags with their own
 *              <Helmet> blocks.
 */
export const DefaultHelmet = (): JSX.Element => (
  <Helmet>
    <title>StartSnap.fun – We're vibe coders. We build StartSnaps!</title>

    {/* Primary Meta Tags */}
    <meta
      name="description"
      content="A community platform for builders to showcase their projects, document their journey in a Vibe Log, and get feedback. Built for the #buildinpublic movement."
    />
    <link rel="canonical" href={SITE_URL} />

    {/* Open Graph / Facebook */}
    <meta property="og:type" content="website" />
    <meta property="og:url" content={SITE_URL} />
    <meta
      property="og:title"
      content="StartSnap.fun – We're vibe coders. We build StartSnaps!"
    />
    <meta
      property="og:description"
      content="A community platform for builders to showcase their projects, document their journey in a Vibe Log, and get feedback. Built for the #buildinpublic movement."
    />
    <meta property="og:image" content={DEFAULT_OG_IMAGE} />
    <meta property="og:site_name" content="startsnap.fun" />

    {/* Twitter */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content={SITE_URL} />
    <meta
      name="twitter:title"
      content="StartSnap.fun – We're vibe coders. We build StartSnaps!"
    />
    <meta
      name="twitter:description"
      content="A community platform for builders to showcase their projects, document their journey in a Vibe Log, and get feedback. Built for the #buildinpublic movement."
    />
    <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
    <meta name="twitter:creator" content="@startsnapfun" />
  </Helmet>
);