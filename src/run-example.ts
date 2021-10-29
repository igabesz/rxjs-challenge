import { Observable, Subject } from "rxjs";


interface ProgressGeneratorCtor {
    new(state$: Observable<'start' | 'finish'>): {
        progress$: Observable<number>,
        destroy(): void;
    },
}

async function loadProgressGenerator(example: string): Promise<ProgressGeneratorCtor | null> {
    switch (example) {
        case '1': return (await import('./1-initial')).ProgressGenerator;
        case '2': return (await import('./2-debugging')).ProgressGenerator;
        case '3': return (await import('./3-fixed')).ProgressGenerator;
        case '4': return (await import('./4-broke-again')).ProgressGenerator;
        case '5': return (await import('./5-really-fixed')).ProgressGenerator;
        default: return null;
    }
}

export async function runExample(example: string): Promise<boolean> {
    const state$ = new Subject<'start' | 'finish'>();
    const ProgressGeneratorType = await loadProgressGenerator(example)
    if (!ProgressGeneratorType) return false;

    const progressGenerator = new ProgressGeneratorType(state$);
    progressGenerator.progress$.subscribe(p => console.log('p', p));

    console.log('Starting');
    state$.next('start');
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('Finished -- no "p" logs expected below this');
    state$.next('finish');
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('Teardown');
    progressGenerator.destroy();
    return true;
}
