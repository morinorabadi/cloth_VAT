import { type StateCreator } from "zustand";

type IState = {
	isLoadingOver: boolean;
};

type IActions = {
	loadingOver: () => void;
	resetLoading: () => void;
};

export type ILoadingSlice = IState & IActions;

const base: IState = {
	isLoadingOver: false,
};

const createLoadingSlice: StateCreator<ILoadingSlice> = (set) => ({
	...base,
	loadingOver: () => set({ isLoadingOver: true }),
	resetLoading: () => set({ ...base }),
});

export default createLoadingSlice;
