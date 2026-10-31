import {zColor} from '@remotion/zod-types';
import {z} from 'zod';

// Props are editable in the Studio sidebar and overridable at render time with --props.
export const showcaseSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
  features: z
    .array(z.object({title: z.string(), caption: z.string()}))
    .length(3),
  accent: zColor(),
  secondary: zColor(),
  sound: z.boolean(),
});

export type ShowcaseProps = z.infer<typeof showcaseSchema>;
