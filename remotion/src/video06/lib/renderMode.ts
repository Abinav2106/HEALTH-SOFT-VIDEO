import {createContext, useContext} from 'react';

// Linear stem faders (1 = unity). Ambience is the stock clips' own location sound.
export type Mix = {voice: number; music: number; sfx: number; ambience: number};
export const DEFAULT_MIX: Mix = {voice: 1, music: 0.35, sfx: 0.7, ambience: 0.2};

// review: burn-in + placeholder plates allowed. master: no overlays, every stock shot must be licensed.
export type RenderMode = {strict: boolean; burnIn: boolean; mix: Mix};

const Ctx = createContext<RenderMode>({strict: false, burnIn: true, mix: DEFAULT_MIX});
export const RenderModeProvider = Ctx.Provider;
export const useRenderMode = () => useContext(Ctx);
