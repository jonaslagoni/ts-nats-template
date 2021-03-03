export enum AvailableHooks {
	onReceivedData = 'onReceivedData',
	beforeSendingData = 'beforeSendingData'
}
export type OnReceivedDataHook = (receivedData: any) => any;
export type BeforeSendingDataHook = (messageToSend: any) => any;

/**
 * This class is used hook into different processes of the client wrapper.
 */
export class Hooks {
	private static instance: Hooks;
	
	private hooks: {
		beforeSendingData: BeforeSendingDataHook[];
		onReceivedData: OnReceivedDataHook[];
	};
	private constructor() { 
		this.hooks = {
			beforeSendingData: [],
			onReceivedData: []
		}
	}
    public static getInstance(): Hooks {
        if (!Hooks.instance) {
            Hooks.instance = new Hooks();
        }
        return Hooks.instance;
	}
	
	/**
	 * Register a hook to be called right before data is being send.
	 * 
	 * Used to transform the data that is about to be send to different formats, encrypted, compressed etc.
	 * @param hook
	 */
	public async registerBeforeSendingData(hook: BeforeSendingDataHook) {
		this.hooks[AvailableHooks.beforeSendingData]
			? this.hooks[AvailableHooks.beforeSendingData].push(hook)
			: [hook];
	}
	public getBeforeSendingDataHook(): BeforeSendingDataHook[] {
		return this.hooks[AvailableHooks.beforeSendingData];
	}
	
	/**
	 * Register a hook to be called when receiving data. 
	 * 
	 * Used for transforming the received data if altered by a 'beforeSendingData' hook.
	 * 
	 * @param hook to call
	 */
	public async registerReceivedData(hook: OnReceivedDataHook) {
		this.hooks[AvailableHooks.onReceivedData]
			? this.hooks[AvailableHooks.onReceivedData].push(hook)
			: [hook];
	}
	public getReceivedDataHook(): OnReceivedDataHook[] {
		return this.hooks[AvailableHooks.onReceivedData];
	}
}