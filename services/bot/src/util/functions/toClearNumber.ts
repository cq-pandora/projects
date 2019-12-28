export default (x: number | string): string => Number(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
