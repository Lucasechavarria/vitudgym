import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal Component', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => {
        mockOnClose.mockClear();
    });

    it('should render when open', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
                <p>Modal Content</p>
            </Modal>
        );

        expect(screen.getByText('Test Modal')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
        const { container } = render(
            <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
                <p>Modal Content</p>
            </Modal>
        );

        expect(container.firstChild).toBeNull();
    });

    it('should call onClose when clicking close button', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
                <p>Modal Content</p>
            </Modal>
        );

        const closeButton = screen.getByText('✕');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should render with different sizes', () => {
        const { rerender } = render(
            <Modal isOpen={true} onClose={mockOnClose} title="Test" size="sm">
                Content
            </Modal>
        );

        expect(screen.getByText('Test')).toBeInTheDocument();

        rerender(
            <Modal isOpen={true} onClose={mockOnClose} title="Test" size="lg">
                Content
            </Modal>
        );

        expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should render with different variants', () => {
        const { rerender } = render(
            <Modal isOpen={true} onClose={mockOnClose} title="Test" variant="danger">
                Content
            </Modal>
        );

        expect(screen.getByText('Test')).toBeInTheDocument();

        rerender(
            <Modal isOpen={true} onClose={mockOnClose} title="Test" variant="success">
                Content
            </Modal>
        );

        expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('should render action buttons when provided', () => {
        render(
            <Modal
                isOpen={true}
                onClose={mockOnClose}
                title="Test"
                actions={
                    <>
                        <button>Cancel</button>
                        <button>Confirm</button>
                    </>
                }
            >
                Content
            </Modal>
        );

        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Confirm')).toBeInTheDocument();
    });
});
