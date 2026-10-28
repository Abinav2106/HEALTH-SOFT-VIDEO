import {createContext, useContext} from 'react';
import {getStaticFiles} from 'remotion';

// review: labelled stand-in plates allowed for missing clips / logo. master: throws instead.
export type RenderMode = {strict: boolean};

const Ctx = createContext<RenderMode>({strict: false});
export const RenderModeProvider = Ctx.Provider;
export const useRenderMode = () => useContext(Ctx);

export const hasStatic = (path: string) => getStaticFiles().some((f) => f.name === path);

export const requireStatic = (path: string, strict: boolean) => {
  const ok = hasStatic(path);
  if (!ok && strict) throw new Error(`GoFloaters master: missing public/${path}`);
  return ok;
};
