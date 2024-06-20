declare global {
	interface Window {
		webkitAudioContext: typeof AudioContext;
	}

	interface Document {
		webkitFullscreenElement: Element | null;
		webkitExitFullscreen: () => void;
	}

	interface Element {
		webkitRequestFullscreen: () => void;
	}
}

export type {};
