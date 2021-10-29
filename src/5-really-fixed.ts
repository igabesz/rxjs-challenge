import { interval, Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';


export class ProgressGenerator {
    private readonly destroyed$ = new Subject<void>();

    readonly progress$ = new Subject<number>();

    constructor(
        private readonly state$: Observable<'start' | 'finish'>,
    ) {
        this.state$.pipe(
            filter(state => state === 'start'),
            takeUntil(this.destroyed$),
        ).subscribe(() => this.onStart());

        // No startEnded$ here!
    }

    destroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
        this.progress$.complete();
    }

    private onStart() {
        // Implementing again w/o the `pairwise` operator
        const startEnded$ = this.state$.pipe(filter(state => state !== 'start'));
        interval(100).pipe(
            takeUntil(startEnded$),
            takeUntil(this.destroyed$),
        ).subscribe(tick => this.onTick(tick));
    }

    private onTick(tick: number) {
        this.progress$.next(tick);
    }
}
