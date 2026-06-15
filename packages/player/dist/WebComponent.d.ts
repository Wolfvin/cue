/** Custom Element that renders a CuePlayer inside a shadow DOM. */
export declare class CueEmbed extends HTMLElement {
    private root;
    private mounted;
    private _goTo;
    /** Observed attributes for reactive updates. */
    static get observedAttributes(): string[];
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void;
    /** Reload the demo from the current attributes. */
    reload(): void;
    /** Navigate to a specific step by index. */
    goTo(n: number): void;
    private loadAndRender;
    private fetchAndRender;
    private parseAndRender;
    private renderPlayer;
    private renderError;
}
//# sourceMappingURL=WebComponent.d.ts.map