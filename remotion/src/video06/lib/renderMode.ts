import {createContext, useContext} from 'react';

// review: burn-in + placeholder plates allowed. master: no overlays, every stock shot must be licensed.
export type RenderMode = {strict: boolean; burnIn: boolean};

const Ctx = createContext<RenderMode>({strict: false, burnIn: true});
export const RenderModeProvider = Ctx.Provider;
export const useRenderMode = () => useContext(Ctx);
