// Learning notes shown in the Notes section. An ordered list of topics
// (independent of the problems categories) matching the course's actual
// topic order. Static reference content -- no DB storage needed. Code
// examples are in C#, matching the DSTALGO course itself (the practice
// judge on this site runs JavaScript for sandboxing reasons -- see the
// README -- but the reference material here follows the course language).
//
// Depth is being filled in incrementally, on purpose: topics 1-5 currently
// get full deep-dive treatment; the rest are solid but will keep growing in
// later passes rather than being rushed out thin all at once.

const notes = [
  {
    slug: 'single-dimension-array',
    title: '1. Single-Dimension Arrays',
    contentHtml: `
      <h4>What an array actually is</h4>
      <p>An array stores its elements in one contiguous block of memory. That's the whole reason indexing is instant: the address of <code>arr[i]</code> is just <code>base_address + i * element_size</code> -- pure arithmetic, no searching required.</p>
      <pre><code>index:     0    1    2    3    4
value:  [ 10,  20,  30,  40,  50 ]
addr:   1000 1004 1008 1012 1016   (4-byte ints, contiguous)</code></pre>
      <p>In C#, arrays are fixed-size and strongly typed once created:</p>
      <pre><code>int[] arr = { 10, 20, 30, 40, 50 };
int x = arr[2];      // 30, O(1)
int len = arr.Length; // 5 -- note: Length, not Count, for arrays</code></pre>
      <p>That contiguity is also an array's biggest weakness: inserting or removing anywhere except the very end means shifting every element after it -- more on that below.</p>

      <h4>Big-O notation, taught through arrays</h4>
      <p>Big-O describes how an algorithm's running time (or memory use) grows as the input size <code>n</code> grows -- a way to compare algorithms that doesn't depend on which CPU you ran them on.</p>
      <ul>
        <li><code>O(1)</code> - constant time. Doesn't matter if <code>n</code> is 10 or 10 million. E.g. reading <code>arr[i]</code>.</li>
        <li><code>O(log n)</code> - the problem shrinks by a constant fraction (usually half) each step. Binary search.</li>
        <li><code>O(n)</code> - one pass over the input. Linear search, summing an array.</li>
        <li><code>O(n log n)</code> - "do O(log n) work, n times," or "split in half repeatedly, then recombine." Efficient sorting lives here.</li>
        <li><code>O(n&sup2;)</code> - nested loops over the same input, e.g. comparing every pair. Selection sort, insertion sort's worst case.</li>
      </ul>
      <p>Just how much does the exponent matter? For <code>n = 1,000</code> elements, at roughly a billion operations per second:</p>
      <pre><code>O(log n)   ~10 operations       -- effectively instant
O(n)       ~1,000 operations    -- effectively instant
O(n log n) ~10,000 operations   -- effectively instant
O(n&sup2;)     ~1,000,000 operations -- still instant</code></pre>
      <p>The gap looks academic at <code>n = 1,000</code>, but at <code>n = 1,000,000</code> an <code>O(n&sup2;)</code> algorithm is doing a <i>trillion</i> operations -- minutes, versus milliseconds for <code>O(n log n)</code>. Doubling your CPU speed only ever buys a constant factor; it can never turn <code>O(n&sup2;)</code> into <code>O(n log n)</code>.</p>
      <p>Rules for reading Big-O out of code: sequential steps <b>add</b> (a loop of <code>n</code> then another loop of <code>n</code> is still <code>O(n)</code>), nested loops <b>multiply</b> (a loop of <code>n</code> inside a loop of <code>n</code> is <code>O(n&sup2;)</code>), and you always <b>drop constants and lower-order terms</b> (<code>O(2n + 5)</code> is just <code>O(n)</code>; <code>O(n&sup2; + n)</code> is just <code>O(n&sup2;)</code>, since the <code>n&sup2;</code> term swamps everything else once <code>n</code> is large).</p>

      <h4>Operation costs on a plain array</h4>
      <pre><code>Operation                  Time
------------------------------------
Access by index             O(1)
Search (unsorted)           O(n)
Search (sorted, binary)     O(log n)
Insert/remove at the end    O(1)  (arrays are fixed-size in C# -- see Lists topic)
Insert/remove at start/mid  O(n)  (everything after shifts)</code></pre>

      <h4>Common pitfalls</h4>
      <ul>
        <li><b>Off-by-one errors</b> - is the loop bound <code>&lt; arr.Length</code> or <code>&lt;= arr.Length</code>? The single most common source of array bugs (and in C#, going one past the end throws an <code>IndexOutOfRangeException</code> rather than silently returning <code>undefined</code>).</li>
        <li><b>Mutating an array while iterating it</b> - removing an element mid-loop shifts every later index, silently skipping the element that slides into the current position.</li>
        <li><b>Confusing "sorted" with "in original order"</b> - binary search requires sorted data; running it on unsorted data gives wrong answers, not just slow ones.</li>
      </ul>
    `,
  },

  {
    slug: 'linear-search',
    title: '2. Linear Search',
    contentHtml: `
      <h4>The idea</h4>
      <p>Check every element, one at a time, until you find the target (or run out of array). No assumptions about ordering required -- it works on any array, sorted or not.</p>
      <pre><code>public static int LinearSearch(int[] arr, int target)
{
    for (int i = 0; i < arr.Length; i++)
    {
        if (arr[i] == target) return i;
    }
    return -1;
}</code></pre>
      <h4>Complexity</h4>
      <ul>
        <li><b>Best case:</b> <code>O(1)</code> -- the target is the first element.</li>
        <li><b>Worst case:</b> <code>O(n)</code> -- the target is last, or not present at all (you still have to check everything to be sure).</li>
        <li><b>Average case:</b> <code>O(n)</code> -- on average you check about half the array.</li>
        <li><b>Space:</b> <code>O(1)</code> -- no extra memory beyond the loop variable.</li>
      </ul>
      <h4>When it's the right choice</h4>
      <p>Linear search is the only option when the data isn't sorted and sorting it first isn't worth the cost (e.g. you're only searching once). It's also simply what you reach for on any data structure that doesn't support random access in a useful order, like a plain linked list.</p>
    `,
  },

  {
    slug: 'binary-search',
    title: '3. Binary Search',
    contentHtml: `
      <h4>The idea</h4>
      <p>If the array is <b>sorted</b>, you don't need to check every element -- compare the target against the middle element, and throw away the half that can't possibly contain it. Repeat on the remaining half. Each comparison cuts the search space in half, which is exactly what makes it <code>O(log n)</code>.</p>
      <pre><code>public static int BinarySearch(int[] arr, int target)
{
    int lo = 0, hi = arr.Length - 1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2; // avoids overflow vs (lo + hi) / 2
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}</code></pre>
      <p>(C#'s built-in <code>Array.BinarySearch(arr, target)</code> does exactly this for you on a sorted array -- worth knowing it exists, but implementing it yourself is the point of the exercise.)</p>
      <h4>Worked trace</h4>
      <pre><code>arr = [1, 3, 5, 7, 9, 11, 13], target = 9

lo=0, hi=6, mid=3 -> arr[3]=7 < 9  -> search right half, lo=4
lo=4, hi=6, mid=5 -> arr[5]=11 > 9 -> search left half,  hi=4
lo=4, hi=4, mid=4 -> arr[4]=9 == 9 -> found at index 4</code></pre>
      <p>Three comparisons found the answer in a 7-element array -- and it would still only take ~20 comparisons in an array of a <i>million</i> sorted elements, since <code>log&#8322;(1,000,000) &asymp; 20</code>.</p>
      <h4>Complexity</h4>
      <p>Best case <code>O(1)</code> (target is the middle element immediately), worst/average case <code>O(log n)</code>, <code>O(1)</code> extra space (iterative version above) or <code>O(log n)</code> space if written recursively (call stack depth).</p>
      <h4>The catch, and common bugs</h4>
      <ul>
        <li><b>Requires sorted input.</b> Run it on unsorted data and it will confidently return a wrong answer -- it never notices the precondition was violated.</li>
        <li><b>Off-by-one on the bounds.</b> Using <code>lo &lt; hi</code> instead of <code>lo &lt;= hi</code>, or forgetting to move <code>lo</code>/<code>hi</code> to <code>mid + 1</code>/<code>mid - 1</code> (using <code>mid</code> itself), are the two classic ways to write an infinite loop or miss the target.</li>
        <li>Computing the midpoint as <code>(lo + hi) / 2</code> can overflow <code>int</code> on very large arrays in some languages; <code>lo + (hi - lo) / 2</code> avoids it and is good habit even when it doesn't strictly matter yet.</li>
        <li>If sorting the array first costs more than the searches you'll do save, plain linear search may actually be cheaper overall -- binary search wins when you search the same sorted collection many times.</li>
      </ul>
    `,
  },

  {
    slug: 'selection-sort',
    title: '4. Selection Sort',
    contentHtml: `
      <h4>The idea</h4>
      <p>Repeatedly find the minimum of the <i>unsorted</i> remainder of the array and swap it into the next open slot at the front. After <code>k</code> passes, the first <code>k</code> elements are guaranteed to be the <code>k</code> smallest, in order.</p>
      <pre><code>[5, 3, 8, 4]
find min of [5,3,8,4] = 3 at index 1 -> swap with index 0 -> [3, 5, 8, 4]
find min of [5,8,4]   = 4 at index 3 -> swap with index 1 -> [3, 4, 8, 5]
find min of [8,5]     = 5 at index 3 -> swap with index 2 -> [3, 4, 5, 8]
Result: [3, 4, 5, 8]</code></pre>
      <pre><code>public static void SelectionSort(int[] arr)
{
    for (int i = 0; i < arr.Length - 1; i++)
    {
        int minIdx = i;
        for (int j = i + 1; j < arr.Length; j++)
        {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        int temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
    }
}</code></pre>
      <h4>Complexity</h4>
      <p><code>O(n&sup2;)</code> comparisons in <i>every</i> case -- best, average, and worst -- because finding the minimum of the remainder always means scanning all of it, regardless of how sorted the array already is. That's its defining weakness compared to insertion sort (next topic), which can finish in <code>O(n)</code> on nearly-sorted input.</p>
      <p>Its one advantage: the number of <b>swaps</b> is only <code>O(n)</code> total (one swap per pass, not per comparison) -- useful if writing to memory is much more expensive than comparing.</p>
      <p><b>Not stable</b> as written above (swapping the minimum into place can jump it past an equal element), <b>in-place</b> (<code>O(1)</code> extra space).</p>
    `,
  },

  {
    slug: 'insertion-sort',
    title: '5. Insertion Sort',
    contentHtml: `
      <h4>The idea</h4>
      <p>The way most people sort a hand of playing cards: keep a growing sorted prefix at the front, and for each new element, slide it left past everything bigger than it until it lands in the right spot within that sorted prefix.</p>
      <pre><code>[5, 3, 8, 4]
sorted prefix [5] | take 3: slide left past 5     -> [3, 5, 8, 4]
sorted prefix [3,5] | take 8: already >= 5, stays -> [3, 5, 8, 4]
sorted prefix [3,5,8] | take 4: slide past 8, 5    -> [3, 4, 5, 8]
Result: [3, 4, 5, 8]</code></pre>
      <pre><code>public static void InsertionSort(int[] arr)
{
    for (int i = 1; i < arr.Length; i++)
    {
        int current = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > current)
        {
            arr[j + 1] = arr[j]; // slide bigger element right
            j--;
        }
        arr[j + 1] = current; // drop into the gap
    }
}</code></pre>
      <h4>Complexity</h4>
      <ul>
        <li><b>Worst case:</b> <code>O(n&sup2;)</code> -- reverse-sorted input, every new element slides all the way to the front.</li>
        <li><b>Best case:</b> <code>O(n)</code> -- already-sorted input, the inner <code>while</code> never runs, just one comparison per element.</li>
        <li><b>Average case:</b> <code>O(n&sup2;)</code>.</li>
        <li><b>Space:</b> <code>O(1)</code>, fully in-place.</li>
      </ul>
      <h4>Selection sort vs. insertion sort</h4>
      <p>Both are <code>O(n&sup2;)</code> simple sorts, but they behave very differently on <i>nearly-sorted</i> data: selection sort <i>always</i> does the full <code>O(n&sup2;)</code> amount of comparisons no matter what, while insertion sort adapts -- the closer the input already is to sorted, the closer it runs to <code>O(n)</code>. That's exactly why insertion sort (not selection sort) is what real-world hybrid sorts fall back to for small sub-arrays: Timsort (used by Python and by Java/.NET's <code>Array.Sort</code> for reference types) and Introsort-based sorts switch to insertion sort once a partition gets small, because on small or nearly-sorted chunks its low overhead and adaptiveness beat the fancier <code>O(n log n)</code> algorithms.</p>
      <p><b>Stable</b> (equal elements never slide past each other), <b>in-place</b>.</p>
    `,
  },

  {
    slug: 'jagged-array',
    title: '6. Jagged Arrays',
    contentHtml: `
      <h4>What makes an array "jagged"</h4>
      <p>A jagged array is an array of arrays where each inner array is allowed a <i>different</i> length -- there's no guarantee of a rectangular shape, unlike a true 2D array (next topic). C# actually gives these two shapes distinct syntax, which makes the difference very explicit:</p>
      <pre><code>// Jagged array: int[][] -- an array of arrays, each row a separate object
int[][] jagged = new int[3][];
jagged[0] = new int[] { 1, 2, 3 };
jagged[1] = new int[] { 4 };
jagged[2] = new int[] { 5, 6 };

// Rectangular 2D array: int[,] -- one single block, every row same length
int[,] grid = new int[3, 3]
{
    { 1, 2, 3 },
    { 4, 5, 6 },
    { 7, 8, 9 },
};</code></pre>
      <h4>Why you'd want one</h4>
      <p>Whenever the natural data isn't rectangular: each student has a different number of grades, each row of a triangular matrix has one more/fewer element than the last, an adjacency list in a graph has a different number of neighbors per node. Forcing that into a rectangular array would waste memory on empty padding (or require a sentinel value to mark "no entry here").</p>
      <pre><code>public static List<int> FlattenJagged(int[][] jagged)
{
    var result = new List<int>();
    foreach (int[] row in jagged)
    {
        foreach (int value in row) result.Add(value);
    }
    return result;
}
// FlattenJagged({{1,2,3},{4},{5,6}}) -> [1, 2, 3, 4, 5, 6]</code></pre>
      <h4>Things to watch for</h4>
      <ul>
        <li>You can't assume <code>row.Length</code> is the same for every row -- always re-check it inside the outer loop rather than caching one row's length for all of them.</li>
        <li>A jagged array can even contain empty rows (<code>new int[0]</code>) or a completely unassigned row (<code>null</code>, since each row in <code>int[][]</code> starts as <code>null</code> until you assign it) -- code that assumes every row is ready to use can throw a <code>NullReferenceException</code> if a row was never initialized.</li>
      </ul>
    `,
  },

  {
    slug: 'multi-dimensional-array',
    title: '7. Multi-Dimensional Arrays',
    contentHtml: `
      <h4>2D arrays as matrices</h4>
      <p>A true 2D array is a rectangular grid -- every row has the same length. In C# this is the <code>int[,]</code> form (distinct from the jagged <code>int[][]</code> from the previous topic): one single underlying block of memory, stored row-by-row ("row-major order"), which is why looping row-first (outer loop = row, inner loop = column) is more cache-friendly than looping column-first -- consecutive accesses within a row are also consecutive in memory.</p>
      <pre><code>int[,] matrix = new int[,]
{
    { 1, 2, 3 },
    { 4, 5, 6 },
    { 7, 8, 9 },
};
int value = matrix[1, 2]; // 6 -- row 1, column 2 (note the comma, not [1][2])
int rows = matrix.GetLength(0); // 3
int cols = matrix.GetLength(1); // 3</code></pre>
      <h4>Common patterns</h4>
      <p><b>Transposing</b> (swap rows and columns):</p>
      <pre><code>public static int[,] Transpose(int[,] matrix)
{
    int rows = matrix.GetLength(0), cols = matrix.GetLength(1);
    int[,] result = new int[cols, rows];
    for (int r = 0; r < rows; r++)
    {
        for (int c = 0; c < cols; c++) result[c, r] = matrix[r, c];
    }
    return result;
}
// Transpose({{1,2,3},{4,5,6}}) -> {{1,4},{2,5},{3,6}}</code></pre>
      <p><b>Spiral traversal:</b> walk the outer ring left-to-right, top-to-bottom, right-to-left, then bottom-to-top, shrinking the boundary inward after each side, and repeat until the boundaries cross.</p>
      <pre><code>[[1,2,3],
 [4,5,6],   -> spiral order: 1, 2, 3, 6, 9, 8, 7, 4, 5
 [7,8,9]]</code></pre>
      <h4>3D and beyond</h4>
      <p>C# supports higher-dimension rectangular arrays too (<code>int[,,]</code> for 3D, and so on), but beyond 2D or 3D it gets much harder to reason about visually, and it's worth asking whether a flatter structure (e.g. a single array with computed indices, or a dictionary keyed by coordinates) would be simpler.</p>
    `,
  },

  {
    slug: 'list',
    title: '8. Lists (Abstract Data Type)',
    contentHtml: `
      <h4>Abstract Data Types (ADTs)</h4>
      <p>An ADT is defined by its <i>behavior</i> -- the operations it supports -- not by how it's implemented under the hood. A "List" ADT supports things like <code>Add</code>, <code>Get</code>, <code>Remove</code>, <code>Count</code>; it deliberately doesn't say whether it's backed by a plain array, a resizing array, or a linked list. That separation is the whole point: code written against the List ADT keeps working even if the underlying implementation is swapped out later.</p>
      <h4>C#'s built-in List&lt;T&gt;: a List backed by a dynamic array</h4>
      <p><code>System.Collections.Generic.List&lt;T&gt;</code> is exactly this ADT, ready to use -- it wraps a plain array but automatically grows when it runs out of room, typically by allocating a new array roughly <i>double</i> the size and copying every element over.</p>
      <pre><code>List<int> numbers = new List<int>();
numbers.Add(10);        // O(1) amortized
numbers.Add(20);
int first = numbers[0]; // O(1), indexer just like an array
numbers.RemoveAt(0);    // O(n) -- everything after shifts left
Console.WriteLine(numbers.Count); // 1 -- Count, not Length, for List<T></code></pre>
      <p>That resize is <code>O(n)</code>, but because it happens only <code>O(log n)</code> times across <code>n</code> appends (the array keeps doubling), the <b>average</b> cost per <code>Add</code> works out to <code>O(1)</code> -- this is called <code>O(1)</code> <i>amortized</i>. Here's roughly what it's doing internally:</p>
      <pre><code>public class MyList<T>
{
    private T[] items = new T[4];
    private int count = 0;

    public void Add(T value)
    {
        if (count == items.Length)
        {
            T[] bigger = new T[items.Length * 2]; // double the capacity
            Array.Copy(items, bigger, items.Length);
            items = bigger;
        }
        items[count++] = value;
    }

    public T Get(int index) => items[index];
    public int Count => count;
}</code></pre>
      <h4>Plain array vs. List&lt;T&gt; vs. LinkedList&lt;T&gt;</h4>
      <pre><code>Operation          int[]      List<T>            LinkedList<T>
------------------------------------------------------------
Get by index       O(1)       O(1)               O(n)
Add at the end      --        O(1) amortized     O(1) (tail tracked)
Insert at front     O(n)       O(n)               O(1)
Fixed size?         yes        no (auto-grows)    no</code></pre>
      <p><code>List&lt;T&gt;</code> trades a small amount of overhead (amortized resizing, bounds-checked operations) for the convenience of not managing size yourself, while keeping the array's <code>O(1)</code> indexed access -- the reason it's usually the default choice in C# over a plain fixed-size array or a <code>LinkedList&lt;T&gt;</code>, unless you specifically need <code>O(1)</code> front-insertion.</p>
    `,
  },

  {
    slug: 'stack',
    title: '9. Stacks',
    contentHtml: `
      <h4>Last In, First Out (LIFO)</h4>
      <p>Think of a stack of plates: you can only add to, or remove from, the top. Core operations, all <code>O(1)</code>:</p>
      <ul>
        <li><code>Push(x)</code> - add <code>x</code> to the top</li>
        <li><code>Pop()</code> - remove and return the top element</li>
        <li><code>Peek()</code> - look at the top element without removing it</li>
      </ul>
      <pre><code>Stack<int> stack = new Stack<int>();
stack.Push(1);      // [1]
stack.Push(2);      // [1, 2]
int top = stack.Peek(); // 2, stack unchanged
int popped = stack.Pop(); // 2, stack is now [1]</code></pre>
      <h4>Classic uses</h4>
      <ul>
        <li><b>Matching parentheses/brackets</b> - push every opening bracket; on a closing bracket, it must match whatever's currently on top.</li>
        <li><b>Undo history</b> - each action pushes onto the stack; undo pops the most recent one.</li>
        <li><b>The call stack itself</b> - every method call pushes a frame; every return pops one. This is also why deep, unbounded recursion causes a <code>StackOverflowException</code>.</li>
        <li><b>Depth-first search (DFS)</b> - explicitly with a <code>Stack&lt;T&gt;</code>, or via recursion (which is really just using the call stack as the stack).</li>
      </ul>
      <h4>Implementation options</h4>
      <p>A stack can be backed by a dynamic array (push/pop at the end -- <code>O(1)</code>, exactly what C#'s <code>Stack&lt;T&gt;</code> already is) or by a linked list (push/pop at the head -- also <code>O(1)</code>, no resizing ever needed). Either way every core operation stays <code>O(1)</code>; the choice mostly comes down to memory overhead and whether you need to bound the maximum size.</p>
    `,
  },

  {
    slug: 'queue',
    title: '10. Queues',
    contentHtml: `
      <h4>First In, First Out (FIFO)</h4>
      <p>Think of a line at a store: whoever got in line first gets served first. Core operations:</p>
      <ul>
        <li><code>Enqueue(x)</code> - add <code>x</code> to the back</li>
        <li><code>Dequeue()</code> - remove and return the element at the front</li>
      </ul>
      <pre><code>Queue<int> queue = new Queue<int>();
queue.Enqueue(1);
queue.Enqueue(2);
int front = queue.Dequeue(); // 1 -- first one in, first one out</code></pre>
      <p>Both are <code>O(1)</code> -- <i>if</i> implemented right. A naive array-based queue that shifts every element left after removing the front is actually <code>O(n)</code> per dequeue. Two common fixes (which is exactly what C#'s <code>Queue&lt;T&gt;</code> does internally):</p>
      <ul>
        <li><b>Circular buffer</b> - a fixed-size array with separate <code>front</code>/<code>rear</code> indices that wrap around, so nothing ever needs to shift.</li>
        <li><b>Linked list</b> - track both <code>head</code> and <code>tail</code> pointers; enqueue appends at the tail, dequeue removes from the head, both <code>O(1)</code>.</li>
      </ul>
      <h4>The "queue from two stacks" trick</h4>
      <p>A queue can also be built entirely from two stacks -- a common interview exercise, and a nice illustration of amortized analysis:</p>
      <pre><code>public class MyQueue
{
    private Stack<int> inStack = new Stack<int>();
    private Stack<int> outStack = new Stack<int>();

    public void Push(int x) => inStack.Push(x);

    public int Pop()
    {
        if (outStack.Count == 0)
        {
            while (inStack.Count > 0) outStack.Push(inStack.Pop());
        }
        return outStack.Pop();
    }
}</code></pre>
      <p><code>Push</code> is always <code>O(1)</code>. <code>Pop</code> looks like it could be <code>O(n)</code> (moving everything from <code>inStack</code> to <code>outStack</code>), but each individual element only ever gets moved between the two stacks <i>once</i> over its lifetime -- so averaged ("amortized") over many operations, <code>Pop</code> is also <code>O(1)</code>.</p>
      <h4>Classic uses</h4>
      <p>Task/print scheduling, and <b>breadth-first search (BFS)</b> -- process the current "layer" of nodes, enqueueing their neighbors to be the next layer, which is exactly what gives BFS its level-by-level exploration order (as opposed to DFS's stack-driven, dive-deep-first order).</p>
    `,
  },

  {
    slug: 'dictionaries',
    title: '11. Dictionaries (Hash Maps)',
    contentHtml: `
      <h4>Key-value storage</h4>
      <p>A dictionary (hash map) stores <b>key-value pairs</b> and gives you <code>O(1)</code> <i>average</i> time to get, set, or delete by key -- a huge upgrade over scanning an array of pairs looking for a matching key, which would be <code>O(n)</code>. In C#, this is <code>Dictionary&lt;TKey, TValue&gt;</code>:</p>
      <pre><code>Dictionary<string, int> ages = new Dictionary<string, int>();
ages["alice"] = 30;      // set (Add also works for new keys)
ages["bob"] = 25;
int aliceAge = ages["alice"]; // 30, O(1) average
bool hasCarol = ages.ContainsKey("carol"); // false
ages.Remove("bob");

// TryGetValue avoids a KeyNotFoundException / double lookup:
if (ages.TryGetValue("alice", out int age))
{
    Console.WriteLine(age); // 30
}</code></pre>
      <h4>How it gets O(1): hashing</h4>
      <p>Internally, a <b>hash function</b> (C# calls it via <code>GetHashCode()</code>) converts each key into a number, which picks a "bucket" (slot) in an underlying array to store that pair in. Looking a key up means: hash it, jump straight to that bucket, and check what's there -- no scanning required. Two different keys can occasionally hash to the same bucket (a <b>collision</b>); implementations handle this either by storing a small list of entries per bucket ("chaining") or by probing for the next open bucket ("open addressing"). As long as the hash function spreads keys out reasonably evenly, collisions stay rare enough that operations stay <code>O(1)</code> on average -- though in a pathological worst case (e.g. an attacker crafting keys that all collide), it degrades toward <code>O(n)</code>.</p>
      <h4>Dictionary vs. array vs. list</h4>
      <pre><code>Operation              int[] / List<T>   Dictionary<K,V>
---------------------------------------------------------
Get by key/index        O(1) by index    O(1) average, by key
Search by value          O(n)             O(1) average (search by key instead)
Preserves insertion      yes              usually yes in practice
order?
Natural fit for          sequences,       "have I seen this before?",
                         ordered data      counting, fast lookup by ID</code></pre>
      <h4>The pattern you'll use constantly: trade space for time</h4>
      <p>Anytime you catch yourself writing a nested loop to check "does some other element satisfy X," ask whether a dictionary (or its cousin, <code>HashSet&lt;T&gt;</code>, for when you only care about presence, not a value) turns it into a single pass. The classic example is Two Sum: instead of checking every pair (<code>O(n&sup2;)</code>), remember every number you've already seen in a dictionary as you go, so checking "have I seen the complement I need?" becomes <code>O(1)</code>:</p>
      <pre><code>public static int[] TwoSum(int[] nums, int target)
{
    var seen = new Dictionary<int, int>(); // value -> index
    for (int i = 0; i < nums.Length; i++)
    {
        int complement = target - nums[i];
        if (seen.TryGetValue(complement, out int j))
        {
            return new int[] { j, i };
        }
        seen[nums[i]] = i;
    }
    return null;
}</code></pre>
      <p>This turns an <code>O(n&sup2;)</code> brute force into <code>O(n)</code> time, at the cost of <code>O(n)</code> extra space for the dictionary -- almost always a trade worth making.</p>
    `,
  },

  {
    slug: 'linked-lists',
    title: 'Linked Lists',
    contentHtml: `
      <h4>Nodes and links</h4>
      <p>A linked list is a chain of <b>nodes</b>, each holding a value and a reference to the next node. Unlike an array, elements are <i>not</i> contiguous in memory -- you can only reach node <code>i</code> by walking from the head, so indexed access is <code>O(n)</code>.</p>
      <pre><code>public class ListNode
{
    public int Val;
    public ListNode Next;

    public ListNode(int val, ListNode next = null)
    {
        Val = val;
        Next = next;
    }
}</code></pre>
      <p>(C# also ships a built-in doubly linked list, <code>System.Collections.Generic.LinkedList&lt;T&gt;</code>, if you don't need to hand-roll the node type yourself.)</p>
      <h4>Why use one anyway?</h4>
      <ul>
        <li>Inserting/removing at the <b>front</b> is <code>O(1)</code> -- no shifting required, unlike an array.</li>
        <li>Size can grow without ever reallocating/copying, unlike a plain array.</li>
        <li>A doubly linked list adds a <code>Prev</code> pointer too, enabling <code>O(1)</code> removal of a known node without walking from the head.</li>
      </ul>
      <h4>Classic patterns</h4>
      <ul>
        <li><b>Fast/slow pointers</b> (Floyd's algorithm) - advance one pointer twice as fast as the other to find the middle, or to detect a cycle (they'll eventually meet if there's a loop).</li>
        <li><b>Reversal</b> - walk the list once, re-pointing each node's <code>Next</code> back to the previous node.</li>
      </ul>
    `,
  },
];

module.exports = { notes };
