declare module 'javascript-lp-solver' {
    export interface IModel {
        optimize: string;
        opType: 'min' | 'max';
        constraints: { [key: string]: any };
        variables: { [key: string]: any };
        ints: { [key: string]: number };
    }

    export interface IResult {
        feasible: boolean;
        result: number;
        bounded: boolean;
        [key: string]: any;
    }

    export function Solve(model: IModel): IResult;
}
