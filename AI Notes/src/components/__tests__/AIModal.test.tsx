import { render, screen, fireEvent } from '@testing-library/react';
import AIModal from '../AIModal';

describe('AIModal Component', () => {
  const mockOnAccept = jest.fn();
  const mockOnDiscard = jest.fn();
  const mockOnClose = jest.fn();
  
  const defaultProps = {
    isOpen: true,
    aiResult: ['Test', ' Result'],
    isLoading: false,
    onAccept: mockOnAccept,
    onDiscard: mockOnDiscard,
    onClose: mockOnClose,
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render when isOpen is true', () => {
    render(<AIModal {...defaultProps} />);
    
    expect(screen.getByText('AI 处理结果')).toBeTruthy();
    expect(screen.getByText('Test Result')).toBeTruthy();
  });
  
  it('should not render when isOpen is false', () => {
    render(<AIModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('AI 处理结果')).toBeNull();
  });
  
  it('should display loading state when isLoading is true', () => {
    render(<AIModal {...defaultProps} isLoading={true} />);
    
    expect(screen.getByText('AI 正在处理中...')).toBeTruthy();
  });
  
  it('should display AI result when aiResult is provided', () => {
    const testResult = ['Hello', ' ', 'World', '!'];
    render(<AIModal {...defaultProps} aiResult={testResult} />);
    
    expect(screen.getByText('Hello World!')).toBeTruthy();
  });
  
  it('should display placeholder when aiResult is empty', () => {
    render(<AIModal {...defaultProps} aiResult={[]} />);
    
    expect(screen.getByText('暂无结果')).toBeTruthy();
  });
  
  it('should call onAccept when accept button is clicked', () => {
    render(<AIModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('接受'));
    
    expect(mockOnAccept).toHaveBeenCalledTimes(1);
  });
  
  it('should call onDiscard when discard button is clicked', () => {
    render(<AIModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('丢弃'));
    
    expect(mockOnDiscard).toHaveBeenCalledTimes(1);
  });
  
  it('should call onClose when close button is clicked', () => {
    render(<AIModal {...defaultProps} />);
    
    fireEvent.click(screen.getByText('×'));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('should call onClose when overlay is clicked', () => {
    render(<AIModal {...defaultProps} />);
    
    const overlay = screen.getByText('AI 处理结果').closest('.modal-overlay');
    fireEvent.click(overlay!);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('should not call onClose when modal content is clicked', () => {
    render(<AIModal {...defaultProps} />);
    
    const modalContent = screen.getByText('AI 处理结果').closest('.modal-content');
    fireEvent.click(modalContent!);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });
  
  it('should disable buttons when isLoading is true', () => {
    render(<AIModal {...defaultProps} isLoading={true} />);
    
    const acceptButton = screen.getByText('接受') as HTMLButtonElement;
    const discardButton = screen.getByText('丢弃') as HTMLButtonElement;
    const closeButton = screen.getByText('×') as HTMLButtonElement;
    
    expect(acceptButton.disabled).toBe(true);
    expect(discardButton.disabled).toBe(true);
    expect(closeButton.disabled).toBe(true);
  });
  
  it('should disable accept button when aiResult is empty', () => {
    render(<AIModal {...defaultProps} aiResult={[]} />);
    
    const acceptButton = screen.getByText('接受') as HTMLButtonElement;
    
    expect(acceptButton.disabled).toBe(true);
  });
  
  it('should enable buttons when isLoading is false and aiResult has content', () => {
    render(<AIModal {...defaultProps} />);
    
    const acceptButton = screen.getByText('接受') as HTMLButtonElement;
    const discardButton = screen.getByText('丢弃') as HTMLButtonElement;
    const closeButton = screen.getByText('×') as HTMLButtonElement;
    
    expect(acceptButton.disabled).toBe(false);
    expect(discardButton.disabled).toBe(false);
    expect(closeButton.disabled).toBe(false);
  });
  
  it('should update display when aiResult changes', () => {
    const { rerender } = render(<AIModal {...defaultProps} aiResult={['Initial']} />);
    
    expect(screen.getByText('Initial')).toBeTruthy();
    
    rerender(<AIModal {...defaultProps} aiResult={['Updated', ' Result']} />);
    
    expect(screen.getByText('Updated Result')).toBeTruthy();
    expect(screen.queryByText('Initial')).toBeNull();
  });
  
  it('should handle single chunk aiResult', () => {
    render(<AIModal {...defaultProps} aiResult={['Single Chunk']} />);
    
    expect(screen.getByText('Single Chunk')).toBeTruthy();
  });
  
  it('should handle multiple small chunks', () => {
    const smallChunks = ['H', 'e', 'l', 'l', 'o', ',', ' ', 'W', 'o', 'r', 'l', 'd', '!'];
    render(<AIModal {...defaultProps} aiResult={smallChunks} />);
    
    expect(screen.getByText('Hello, World!')).toBeTruthy();
  });
});
