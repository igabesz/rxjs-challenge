import { interval, Observable, Subject } from 'rxjs';
import { filter, mapTo, pairwise, takeUntil } from 'rxjs/operators';

export class ProgressGenerator {
    // I prefer explicit `destroyed$` over `untilDestroyed(this)` solutions
    private readonly destroyed$ = new Subject<void>();
    private readonly startEnded$: Observable<void>;

    // This will be consumed externally.
    readonly progress$ = new Subject<number>();

    constructor(
        private readonly state$: Observable<'start' | 'finish'>,
    ) {
        this.state$.pipe(
            filter(state => state === 'start'),
            takeUntil(this.destroyed$),
        ).subscribe(() => this.onStart());

        this.startEnded$ = state$.pipe(
            pairwise(),
            filter(([prev, current]) => prev === 'start' && current !== 'start'),
            mapTo(undefined)); // For type conformity
    }

    destroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.progress$.complete();
    }

    private onStart() {
        interval(100).pipe(
            // Some calculations based on the elapsed time
            takeUntil(this.startEnded$),
            takeUntil(this.destroyed$),
        ).subscribe(tick => this.onTick(tick));
    }

    private onTick(tick: number) {
        // More calculations here
        this.progress$.next(tick);
    }
}
