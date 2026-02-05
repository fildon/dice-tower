import { HISTORY } from './constants';

export class HistoryManager {
  private historyListElement: HTMLDivElement;
  private emptyMessage: HTMLDivElement | null = null;

  constructor(historyListElement: HTMLDivElement) {
    this.historyListElement = historyListElement;
    this.initializeEmptyState();
  }

  private initializeEmptyState(): void {
    this.emptyMessage = document.createElement('div');
    this.emptyMessage.className = 'history-empty';
    this.emptyMessage.textContent = 'No rolls yet!';
    this.historyListElement.appendChild(this.emptyMessage);
  }

  addRoll(roll: number, dieType: string): void {
    this.removeEmptyMessage();
    
    const historyItem = this.createHistoryItem(roll, dieType);
    
    // Add to top of list
    this.historyListElement.insertBefore(historyItem, this.historyListElement.firstChild);
    
    // Keep only last N rolls
    this.trimHistory();
  }

  private removeEmptyMessage(): void {
    if (this.emptyMessage && this.emptyMessage.parentNode) {
      this.historyListElement.removeChild(this.emptyMessage);
      this.emptyMessage = null;
    }
  }

  private createHistoryItem(roll: number, dieType: string): HTMLDivElement {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const dieTypeSpan = document.createElement('span');
    dieTypeSpan.className = 'history-die-type';
    dieTypeSpan.textContent = dieType;
    
    const numberSpan = document.createElement('span');
    numberSpan.className = 'history-number';
    numberSpan.textContent = roll.toString();
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'history-time';
    timeSpan.textContent = new Date().toLocaleTimeString();
    
    historyItem.appendChild(dieTypeSpan);
    historyItem.appendChild(numberSpan);
    historyItem.appendChild(timeSpan);
    
    return historyItem;
  }

  private trimHistory(): void {
    while (this.historyListElement.children.length > HISTORY.MAX_ITEMS) {
      this.historyListElement.removeChild(this.historyListElement.lastChild!);
    }
  }

  clear(): void {
    this.historyListElement.innerHTML = '';
    this.initializeEmptyState();
  }
}
