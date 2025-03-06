import { type StateCreator } from "zustand";
import createLoadingSlice, { type ILoadingSlice } from "./loading.slice";

type IActions = {
	reset: () => void;
};

export type IResetSlice = IActions;

const createResetSlice: StateCreator<
	IResetSlice & ILoadingSlice,
	[],
	[],
	IResetSlice
> = (...a) => ({
	reset: () => {
		createLoadingSlice(...a).resetLoading();
	},
});

export default createResetSlice;
