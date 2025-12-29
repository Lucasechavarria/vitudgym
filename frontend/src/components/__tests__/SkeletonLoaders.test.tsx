import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { SkeletonCard, SkeletonTable, SkeletonStats } from '../SkeletonLoaders';

describe('SkeletonLoaders Components', () => {
    describe('SkeletonCard', () => {
        it('should render skeleton card', () => {
            const { container } = render(<SkeletonCard />);
            const skeleton = container.querySelector('.animate-pulse');
            expect(skeleton).toBeInTheDocument();
        });

        it('should render multiple skeleton cards', () => {
            const { container } = render(
                <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            );
            const skeletons = container.querySelectorAll('.animate-pulse');
            expect(skeletons.length).toBe(3);
        });
    });

    describe('SkeletonTable', () => {
        it('should render skeleton table', () => {
            const { container } = render(<SkeletonTable />);
            const skeleton = container.querySelector('.animate-pulse');
            expect(skeleton).toBeInTheDocument();
        });

        it('should render table structure', () => {
            const { container } = render(<SkeletonTable />);
            const rows = container.querySelectorAll('.h-12');
            expect(rows.length).toBeGreaterThan(0);
        });
    });

    describe('SkeletonStats', () => {
        it('should render skeleton stats', () => {
            const { container } = render(<SkeletonStats />);
            const skeleton = container.querySelector('.animate-pulse');
            expect(skeleton).toBeInTheDocument();
        });

        it('should render multiple skeleton stats', () => {
            const { container } = render(
                <>
                    <SkeletonStats />
                    <SkeletonStats />
                    <SkeletonStats />
                    <SkeletonStats />
                </>
            );
            const skeletons = container.querySelectorAll('.animate-pulse');
            // SkeletonStats renderiza 4 items, y renderizamos 4 SkeletonStats = 16 items
            expect(skeletons.length).toBe(16);
        });
    });
});
