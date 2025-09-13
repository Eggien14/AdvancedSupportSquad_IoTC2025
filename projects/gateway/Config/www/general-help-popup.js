class GeneralHelpPopup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._rendered = false;
  }

  connectedCallback() {
    if (!this._rendered) this._render();
  }

  _render() {
    const style = `
      :host {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: none;
        z-index: 500; /* trên map nhưng dưới các popup khác */
      }

      :host(.show) {
        display: block;
      }

      .overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(3px);
      }

      .popup {
        background: white;
        border-radius: 12px;
        padding: 8px;
        width: 25%;
        max-width: 300px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      }

      .popup img {
        width: 100%;
        height: auto;
        border-radius: 8px;
        display: block;
      }

      .close-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: none;
        font-size: 22px;
        cursor: pointer;
        color: #333;
      }
    `;

    this.shadowRoot.innerHTML = `
      <style>${style}</style>
      <div class="overlay">
        <div class="popup">
          <button class="close-btn">×</button>
          <img src="/local/product_pic/voice-cmd.jpg" alt="Command List">
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.close-btn')
      .addEventListener('click', () => this.hide());
    this.shadowRoot.querySelector('.overlay')
      .addEventListener('click', (e) => {
        if (e.target === this.shadowRoot.querySelector('.overlay')) {
          this.hide();
        }
      });
  }

  show() {
    this.classList.add('show');
  }

  hide() {
    this.classList.remove('show');
  }

  static showHelp() {
    const mapCard = window.currentMapCard;  // tham chiếu đã có trong general-map-card
    if (!mapCard) return;

    let popup = mapCard.shadowRoot.querySelector('general-help-popup');
    if (!popup) {
      popup = document.createElement('general-help-popup');
      // gắn vào map-container để overlay chỉ trong card
      const container = mapCard.shadowRoot.querySelector('.map-container');
      container.style.position = 'relative'; // đảm bảo positioning
      container.appendChild(popup);
    }
    popup.show();
  }
}

customElements.define('general-help-popup', GeneralHelpPopup);
export default GeneralHelpPopup;