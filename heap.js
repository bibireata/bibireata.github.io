class MinHeap {
    constructor(comparator = (a,b) => a - b) {
        // binary tree as array: parent = floor(child / 2), children = 2 * parent, 2 * parent + 1
        // [null, parent, left, right, ...]
        this.heap = [null];
        this.comparator = comparator;
    }
  
    push(node) {
        // add at the end, swap parent/child upwards to preserve order
        this.heap.push(node);
        let i = this.heap.length - 1;
        let pi = Math.floor(i / 2);
        while (pi > 0 && this.comparator(this.heap[i], this.heap[pi]) < 0) {
            const p = this.heap[pi];
            this.heap[pi] = this.heap[i];
            this.heap[i] = p;
            i = pi;
            pi = Math.floor(i / 2);
        }
    }

    select(i) {
        // select first order child
        let [li, ri] = [2 * i, 2 * i + 1];
        return ri < this.heap.length && this.comparator(this.heap[ri], this.heap[li]) < 0 ? ri : li;
    }

    pop() {
        // bring last element to root, swap parent/child downward to preserve order 
        if (this.heap.length < 3) {
            const node = this.heap.pop();
            this.heap[0] = null;
            return node;
        }
        const node = this.heap[1];
        this.heap[1] = this.heap.pop();
        let i = 1;
        let ci = this.select(i);
        while (ci < this.heap.length && this.comparator(this.heap[i], this.heap[ci]) > 0) {
            let c = this.heap[ci];
            this.heap[ci] = this.heap[i];
            this.heap[i] = c;
            i = ci;
            ci = this.select(i);
        }
        return node;
    }
}
