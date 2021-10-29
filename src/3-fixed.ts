import { interval, Observable, Subject } from 'rxjs';
import { filter, mapTo, pairwise, share, takeUntil, tap } from 'rxjs/operators';


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
            share()); // This fixes the stream for us! (Or does it?)

        this.startEnded$.subscribe(() => console.log('startEnded 1'))
    }

    destroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.progress$.complete();
    }

    private onStart() {
        this.startEnded$.subscribe(() => console.log('startEnded 2'))

        interval(100).pipe(
            takeUntil(this.startEnded$.pipe(tap(() => console.log('startEnded TAP')))),
            takeUntil(this.destroyed$.pipe(tap(() => console.log('destroyed!')))),
        ).subscribe(tick => this.onTick(tick));
    }

    private onTick(tick: number) {
        this.progress$.next(tick);
    }
}
