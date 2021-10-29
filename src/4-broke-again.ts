import { interval, Observable, Subject } from 'rxjs';
import { filter, mapTo, pairwise, share, takeUntil } from 'rxjs/operators';


export class ProgressGenerator {
    private readonly destroyed$ = new Subject<void>();
    private readonly startEnded$: Observable<void>;

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
            mapTo(undefined),
            share()); // It's still here, yet it won't work properly
    }

    destroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.progress$.complete();
    }

    private onStart() {
        interval(100).pipe(
            takeUntil(this.startEnded$),
            takeUntil(this.destroyed$),
        ).subscribe(tick => this.onTick(tick));
    }

    private onTick(tick: number) {
        this.progress$.next(tick);
    }
}
