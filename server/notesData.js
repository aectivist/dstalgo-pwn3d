// Learning notes shown in the Notes section. An ordered list of topics
// (independent of the problems categories) matching the course's actual
// topic order. Static reference content -- no DB storage needed. Code
// examples are in C#, matching the DSTALGO course itself (the practice
// judge on this site runs JavaScript for sandboxing reasons -- see the
// README -- but the reference material here follows the course language).
//
// Written for beginners: every topic leads with a plain-English idea
// before any code or notation, and jargon (contiguous, amortized, etc.)
// is defined in place the first time it shows up rather than assumed.

const notes = [
  {
    slug: 'single-dimension-array',
    title: '1. Single-Dimension Arrays',
    contentHtml: `
      <h4>What an array actually is</h4>
      <p>An array is just a numbered row of boxes, all the same type, sitting right next to each other. The number of each box is called its <b>index</b>, and indexes start at <code>0</code>, not <code>1</code> -- so a 5-box array has indexes <code>0, 1, 2, 3, 4</code>, and there's no box <code>5</code>.</p>
      <pre><code>index:     0    1    2    3    4
value:  [ 10,  20,  30,  40,  50 ]</code></pre>
      <p>In C#, arrays are fixed-size (you decide how many boxes you want up front, and that never changes) and every box holds the same type:</p>
      <pre><code>int[] arr = { 10, 20, 30, 40, 50 };
int x = arr[2];      // 30 -- box number 2, which is the 3rd box
int len = arr.Length; // 5 -- note: Length, not Count, for arrays</code></pre>
      <p>The reason <code>arr[2]</code> is instant, no matter how big the array is, comes down to how it's stored: because every box sits directly next to the last one in memory (this is called <b>contiguous</b> storage), the computer can jump straight to any box with simple math -- "start of the array, plus 2 boxes over" -- instead of counting through the boxes one by one.</p>
      <p>That same layout is also an array's biggest weakness: since the boxes are packed with no gaps, inserting or removing a box anywhere except the very end means shifting every box after it over by one, to keep things packed. More on that below.</p>

      <h4>Big-O notation: a way to talk about "how slow"</h4>
      <p>As your programs deal with bigger inputs (more items in a list, more users, more rows in a file), some ways of writing code stay fast and some slow down a lot. <b>Big-O notation</b> is just a shorthand for describing that: how much more work does an algorithm do as the input size, usually called <code>n</code>, grows? It deliberately ignores things like "how fast is this specific computer," so it's a fair way to compare two approaches to the same problem.</p>
      <ul>
        <li><code>O(1)</code> - "constant time." The amount of work never changes, whether <code>n</code> is 10 or 10 million. Reading <code>arr[i]</code> is like this.</li>
        <li><code>O(log n)</code> - the problem gets cut roughly in half each step, so the work barely grows even as <code>n</code> gets huge. Binary search (next topic) works this way.</li>
        <li><code>O(n)</code> - one pass over everything. Double the input, double the work. Linear search, summing an array.</li>
        <li><code>O(n log n)</code> - a bit more than one pass, but still very manageable. Most good general-purpose sorting algorithms land here.</li>
        <li><code>O(n&sup2;)</code> - roughly "for every item, look at every other item" -- nested loops over the same input. Selection sort and insertion sort's worst case both land here.</li>
      </ul>
      <p>Why bother with any of this? Because the gap between these gets enormous as <code>n</code> grows. For <code>n = 1,000</code> items, at roughly a billion operations per second:</p>
      <pre><code>O(log n)   ~10 operations       -- effectively instant
O(n)       ~1,000 operations    -- effectively instant
O(n log n) ~10,000 operations   -- effectively instant
O(n&sup2;)     ~1,000,000 operations -- still instant</code></pre>
      <p>At <code>n = 1,000</code> the difference doesn't even matter yet -- everything feels instant. But at <code>n = 1,000,000</code>, an <code>O(n&sup2;)</code> algorithm suddenly needs a <i>trillion</i> operations: minutes of real time, versus milliseconds for <code>O(n log n)</code> on the exact same input. And buying a faster computer doesn't fix this -- it only ever speeds everything up by the same fixed multiplier, it can never turn an <code>O(n&sup2;)</code> algorithm into an <code>O(n log n)</code> one.</p>
      <p>A few rules of thumb for eyeballing Big-O directly from code: two separate loops back to back <b>add</b> together (a loop of <code>n</code>, then another loop of <code>n</code>, is still just <code>O(n)</code> overall -- it doesn't become <code>O(n&sup2;)</code>), a loop <i>inside</i> another loop <b>multiplies</b> (a loop of <code>n</code> nested inside a loop of <code>n</code> is <code>O(n&sup2;)</code>), and you always <b>ignore constants and small terms</b> once <code>n</code> gets large -- <code>O(2n + 5)</code> is just written as <code>O(n)</code>, and <code>O(n&sup2; + n)</code> is just written as <code>O(n&sup2;)</code>, because the <code>n&sup2;</code> part completely dominates the <code>n</code> part once <code>n</code> is big enough.</p>

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
        <li><b>Off-by-one errors</b> - is the loop bound <code>&lt; arr.Length</code> or <code>&lt;= arr.Length</code>? This is the single most common source of array bugs. In C#, reading one box past the end doesn't quietly give you garbage -- it throws an <code>IndexOutOfRangeException</code> and crashes, which is actually a helpful safety net while you're learning.</li>
        <li><b>Changing an array while looping over it</b> - removing an element mid-loop shifts every later index down by one, which can silently make you skip the element that slides into the spot you were just at.</li>
        <li><b>Confusing "sorted" with "in the order I put things in"</b> - binary search only works on sorted data. Running it on unsorted data doesn't just make it slow, it gives you a flat-out wrong answer, with no warning that anything went wrong.</li>
      </ul>
    `,
  },

  {
    slug: 'linear-search',
    title: '2. Linear Search',
    contentHtml: `
      <h4>The idea</h4>
      <p>This is the most obvious way to find something: start at the beginning, and check each element one at a time until you either find what you're looking for or reach the end of the array. It doesn't care whether the array is sorted -- it works on any array at all.</p>
      <pre><code>public static int LinearSearch(int[] arr, int target)
{
    for (int i = 0; i < arr.Length; i++)
    {
        if (arr[i] == target) return i; // found it -- report the index
    }
    return -1; // walked the whole array, never found it
}</code></pre>
      <h4>Complexity</h4>
      <ul>
        <li><b>Best case:</b> <code>O(1)</code> -- you get lucky and the target is the very first element.</li>
        <li><b>Worst case:</b> <code>O(n)</code> -- the target is last, or isn't in the array at all (you still have to check every element to be sure it's really missing).</li>
        <li><b>Average case:</b> <code>O(n)</code> -- on average, you'll check about half the array before finding it.</li>
        <li><b>Space:</b> <code>O(1)</code> -- it doesn't need any extra memory beyond the loop counter, no matter how big the array is.</li>
      </ul>
      <h4>When it's the right choice</h4>
      <p>Reach for linear search whenever the data isn't sorted and it's not worth the effort to sort it first -- for example, if you're only going to search once. It's also simply the only option on data structures that don't let you jump around freely, like a linked list (covered later), where you can't "skip to the middle" the way binary search needs to.</p>
    `,
  },

  {
    slug: 'binary-search',
    title: '3. Binary Search',
    contentHtml: `
      <h4>The idea</h4>
      <p>If you already know the array is <b>sorted</b>, there's a much smarter way to search than checking every element. Think of looking up a name in a phone book: you don't start at page 1 -- you flip to roughly the middle, see whether you need to go earlier or later, and repeat on that half. That's exactly what binary search does: compare the target to the middle element, then throw away the half of the array that couldn't possibly contain it, and repeat on what's left. Cutting the search space in half every single step is what makes this <code>O(log n)</code> instead of <code>O(n)</code>.</p>
      <pre><code>public static int BinarySearch(int[] arr, int target)
{
    int lo = 0, hi = arr.Length - 1;
    while (lo <= hi)
    {
        int mid = lo + (hi - lo) / 2; // the middle index, written to avoid overflow
        if (arr[mid] == target) return mid;      // found it
        if (arr[mid] < target) lo = mid + 1;      // target must be in the right half
        else hi = mid - 1;                        // target must be in the left half
    }
    return -1; // ran out of places to look
}</code></pre>
      <p>(C# actually has this built in as <code>Array.BinarySearch(arr, target)</code>, which does exactly this on a sorted array. Worth knowing it exists for real code -- but writing it yourself here is how the idea actually sinks in.)</p>
      <h4>Worked trace</h4>
      <p>Here's the algorithm above running step by step, so you can see the search space shrinking:</p>
      <pre><code>arr = [1, 3, 5, 7, 9, 11, 13], target = 9

lo=0, hi=6, mid=3 -> arr[3]=7 < 9  -> search right half, lo=4
lo=4, hi=6, mid=5 -> arr[5]=11 > 9 -> search left half,  hi=4
lo=4, hi=4, mid=4 -> arr[4]=9 == 9 -> found at index 4</code></pre>
      <p>Just three comparisons found the answer in a 7-element array. That might not sound impressive yet, but the payoff shows up at scale: the same approach would still only take around 20 comparisons to search a sorted array of a <i>million</i> elements, since <code>log&#8322;(1,000,000) &asymp; 20</code>.</p>
      <h4>Complexity</h4>
      <p>Best case is <code>O(1)</code> (the target happens to be the middle element right away). Worst and average case are both <code>O(log n)</code>. Space is <code>O(1)</code> extra for the loop version shown above (or <code>O(log n)</code> if you write it recursively instead, since each recursive call adds a frame to the call stack).</p>
      <h4>The catch, and common bugs</h4>
      <ul>
        <li><b>It requires sorted input.</b> Run it on unsorted data and it won't warn you or slow down -- it will just confidently hand back a wrong answer.</li>
        <li><b>Off-by-one mistakes in the bounds</b> are the classic bug here: using <code>lo &lt; hi</code> instead of <code>lo &lt;= hi</code>, or forgetting to move past <code>mid</code> (writing <code>lo = mid</code> instead of <code>lo = mid + 1</code>) can cause an infinite loop or make you miss the target entirely.</li>
        <li>Computing the midpoint as <code>(lo + hi) / 2</code> can technically overflow on very large arrays in some languages; writing it as <code>lo + (hi - lo) / 2</code> avoids that and is worth building as a habit even before it matters.</li>
        <li>If you'd have to sort the array first, and you're only searching it once or twice, that sorting cost might outweigh what you save -- binary search really pays off when you search the <i>same</i> sorted collection over and over.</li>
      </ul>
    `,
  },

  {
    slug: 'selection-sort',
    title: '4. Selection Sort',
    contentHtml: `
      <h4>The idea</h4>
      <p>Selection sort works in passes: on each pass, look through the part of the array that isn't sorted yet, find the smallest value in it, and swap that value into the next open slot at the front. After <code>k</code> passes, the first <code>k</code> elements of the array are guaranteed to be the <code>k</code> smallest values, already in the right order.</p>
      <pre><code>[5, 3, 8, 4]
find min of [5,3,8,4] = 3 at index 1 -> swap with index 0 -> [3, 5, 8, 4]
find min of [5,8,4]   = 4 at index 3 -> swap with index 1 -> [3, 4, 8, 5]
find min of [8,5]     = 5 at index 3 -> swap with index 2 -> [3, 4, 5, 8]
Result: [3, 4, 5, 8]</code></pre>
      <pre><code>public static void SelectionSort(int[] arr)
{
    for (int i = 0; i < arr.Length - 1; i++)
    {
        int minIdx = i; // assume the current position holds the smallest, for now
        for (int j = i + 1; j < arr.Length; j++)
        {
            if (arr[j] < arr[minIdx]) minIdx = j; // found something smaller -- remember it
        }
        // swap the smallest found into position i
        int temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
    }
}</code></pre>
      <h4>Complexity</h4>
      <p>This is <code>O(n&sup2;)</code> in <i>every</i> case -- best, average, and worst -- because finding the minimum of the remaining unsorted part always means scanning all of it, no matter how sorted the array already happens to be. That's its main weakness compared to insertion sort (the next topic), which can finish much faster, in <code>O(n)</code>, on input that's already nearly sorted.</p>
      <p>Its one real advantage: the number of <b>swaps</b> is only <code>O(n)</code> total -- just one swap per pass, not one per comparison. That's useful in situations where actually writing to memory is much more expensive than just comparing values.</p>
      <p>As written above, this version is <b>not stable</b> (a swap can occasionally jump an element past another equal element, changing their relative order) and it's <b>in-place</b>, meaning it needs no extra memory beyond the array itself (<code>O(1)</code> extra space).</p>
    `,
  },

  {
    slug: 'insertion-sort',
    title: '5. Insertion Sort',
    contentHtml: `
      <h4>The idea</h4>
      <p>This is the way most people naturally sort a hand of playing cards: keep a sorted pile in your hand, and for each new card you pick up, slide it left past every card that's bigger than it, until it lands in the right spot. Insertion sort does exactly this to an array -- it keeps a growing "sorted prefix" at the front, and for each new element, slides it left past everything bigger until it lands in place.</p>
      <pre><code>[5, 3, 8, 4]
sorted prefix [5] | take 3: slide left past 5     -> [3, 5, 8, 4]
sorted prefix [3,5] | take 8: already >= 5, stays -> [3, 5, 8, 4]
sorted prefix [3,5,8] | take 4: slide past 8, 5    -> [3, 4, 5, 8]
Result: [3, 4, 5, 8]</code></pre>
      <pre><code>public static void InsertionSort(int[] arr)
{
    for (int i = 1; i < arr.Length; i++)
    {
        int current = arr[i]; // the "new card" we're inserting
        int j = i - 1;
        while (j >= 0 && arr[j] > current)
        {
            arr[j + 1] = arr[j]; // slide the bigger element one spot to the right
            j--;
        }
        arr[j + 1] = current; // drop the current value into the gap we made
    }
}</code></pre>
      <h4>Complexity</h4>
      <ul>
        <li><b>Worst case:</b> <code>O(n&sup2;)</code> -- happens on reverse-sorted input, where every new element has to slide all the way to the front.</li>
        <li><b>Best case:</b> <code>O(n)</code> -- happens on already-sorted input, where the inner <code>while</code> loop never runs at all, and each element only costs a single comparison.</li>
        <li><b>Average case:</b> <code>O(n&sup2;)</code>.</li>
        <li><b>Space:</b> <code>O(1)</code>, fully in-place -- no extra array needed.</li>
      </ul>
      <h4>Selection sort vs. insertion sort</h4>
      <p>Both are <code>O(n&sup2;)</code> in general, but they behave very differently on data that's <i>already close to sorted</i>: selection sort always does the same full amount of work no matter what the input looks like, while insertion sort adapts -- the closer the input already is to sorted, the closer it gets to running in <code>O(n)</code>. That's exactly why real-world sorting libraries fall back on insertion sort (not selection sort) for small chunks of data: Timsort (used by Python, and by .NET/Java's sort for reference types) and other hybrid sorts switch over to insertion sort once a section gets small, because its low overhead and ability to take advantage of near-sorted data beats fancier <code>O(n log n)</code> algorithms at that scale.</p>
      <p>Insertion sort is <b>stable</b> (equal elements never slide past each other, so their original order is preserved) and <b>in-place</b>.</p>
    `,
  },

  {
    slug: 'jagged-array',
    title: '6. Jagged Arrays',
    contentHtml: `
      <h4>What makes an array "jagged"</h4>
      <p>A jagged array is an "array of arrays" where each inner array is allowed to be a <i>different</i> length -- there's no requirement that they line up into a neat rectangle, unlike a true 2D array (the next topic). C# gives these two shapes distinct syntax, which makes the difference easy to spot:</p>
      <pre><code>// Jagged array: int[][] -- an array of arrays, each row its own separate object
int[][] jagged = new int[3][];
jagged[0] = new int[] { 1, 2, 3 };
jagged[1] = new int[] { 4 };
jagged[2] = new int[] { 5, 6 };

// Rectangular 2D array: int[,] -- one single block, every row the same length
int[,] grid = new int[3, 3]
{
    { 1, 2, 3 },
    { 4, 5, 6 },
    { 7, 8, 9 },
};</code></pre>
      <h4>Why you'd want one</h4>
      <p>Use a jagged array whenever the data naturally isn't rectangular: each student has a different number of grades, each row of a triangle-shaped table has one more or fewer element than the last, or a graph where each node has a different number of neighbors. Forcing data like that into a rectangular array would waste memory on empty padding, or force you to invent a placeholder value to mean "nothing here."</p>
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
        <li>You can't assume <code>row.Length</code> is the same for every row -- always check it fresh inside the outer loop, rather than measuring one row and reusing that number for all of them.</li>
        <li>A jagged array can contain an empty row (<code>new int[0]</code>), or a row that was never assigned anything at all (<code>null</code> -- every row in a freshly created <code>int[][]</code> starts out as <code>null</code> until you explicitly assign it). Code that assumes every row is ready to use can throw a <code>NullReferenceException</code> if it hits a row that was never set up.</li>
      </ul>
    `,
  },

  {
    slug: 'multi-dimensional-array',
    title: '7. Multi-Dimensional Arrays',
    contentHtml: `
      <h4>2D arrays as grids</h4>
      <p>A true 2D array is a rectangular grid, like a spreadsheet -- every row has exactly the same length. In C# this is the <code>int[,]</code> form (different from the jagged <code>int[][]</code> from the last topic). It's stored as one single block of memory, laid out row by row. Because of that layout, looping row-first (outer loop walks the rows, inner loop walks the columns) tends to be faster in practice than looping column-first, since values in the same row also sit next to each other in memory, and reading things that are near each other in memory is cheaper than jumping around.</p>
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
      <p><b>Transposing</b> (flip rows and columns, so row 1 becomes column 1):</p>
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
      <p><b>Spiral traversal:</b> walk the outer ring of the grid left-to-right, then top-to-bottom, then right-to-left, then bottom-to-top, shrinking the boundary inward by one after each side, and keep repeating until there's nothing left inside the boundary.</p>
      <pre><code>[[1,2,3],
 [4,5,6],   -> spiral order: 1, 2, 3, 6, 9, 8, 7, 4, 5
 [7,8,9]]</code></pre>
      <h4>3D and beyond</h4>
      <p>C# does support higher-dimension rectangular arrays too (<code>int[,,]</code> for 3D, and so on), but once you go past 2D or 3D it gets a lot harder to picture what's going on. At that point it's worth asking whether a flatter structure would actually be simpler -- for example, a single 1D array with some index math, or a dictionary keyed by coordinates (see the Dictionaries topic).</p>
    `,
  },

  {
    slug: 'list',
    title: '8. Lists (Abstract Data Type)',
    contentHtml: `
      <h4>Abstract Data Types (ADTs): what vs. how</h4>
      <p>An <b>Abstract Data Type</b> (ADT) is a way of describing a data structure by <i>what it can do</i> -- the operations it supports -- without saying anything about <i>how</i> it does them internally. A "List" ADT, for example, just promises operations like <code>Add</code>, <code>Get</code>, <code>Remove</code>, and <code>Count</code>. It deliberately doesn't say whether it's built on top of a plain array, a resizing array, or a linked list under the hood. That separation is the whole point: code written against "a List" keeps working even if you later swap out how it's actually implemented behind the scenes.</p>
      <h4>C#'s built-in List&lt;T&gt;: a List backed by a resizing array</h4>
      <p><code>System.Collections.Generic.List&lt;T&gt;</code> is exactly this List ADT, ready to use out of the box. Under the hood it's just a plain array, but one that automatically grows when it runs out of room -- typically by allocating a brand-new array roughly <i>double</i> the size, and copying every existing element into it.</p>
      <pre><code>List<int> numbers = new List<int>();
numbers.Add(10);        // O(1) amortized -- see below
numbers.Add(20);
int first = numbers[0]; // O(1), works just like an array's indexer
numbers.RemoveAt(0);    // O(n) -- everything after index 0 shifts left
Console.WriteLine(numbers.Count); // 1 -- Count, not Length, for List<T></code></pre>
      <p>That resizing step is <code>O(n)</code> on its own (copying every element takes time proportional to how many there are), but here's the key insight: it only has to happen occasionally -- roughly <code>O(log n)</code> times total across <code>n</code> additions, since the array keeps doubling in size each time. Spread that occasional expensive step out over all the cheap <code>O(1)</code> additions in between, and the <b>average</b> cost per <code>Add</code> works out to just <code>O(1)</code>. This is called <code>O(1)</code> <i>amortized</i> -- "amortized" just means "averaged out over many operations, including the occasional expensive one." Here's roughly what <code>List&lt;T&gt;</code> is doing internally to pull that off:</p>
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
      <p><code>List&lt;T&gt;</code> takes on a small amount of overhead (the occasional resize, and checking bounds on every access) in exchange for not having to manage the size yourself, while still keeping an array's fast <code>O(1)</code> indexed access. That trade-off is exactly why it's usually the default choice in C# over a plain fixed-size array or a <code>LinkedList&lt;T&gt;</code> -- unless you specifically need fast insertion at the front, which is where a linked list wins (see the Linked Lists topic).</p>
    `,
  },

  {
    slug: 'stack',
    title: '9. Stacks',
    contentHtml: `
      <h4>Last In, First Out (LIFO)</h4>
      <p>Picture a stack of plates: you can only ever add a plate to the top, or take a plate off the top -- never from the middle or bottom. That's a stack. The three core operations, all <code>O(1)</code>:</p>
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
        <li><b>Matching parentheses/brackets</b> - push every opening bracket you see; when you hit a closing bracket, it must match whatever's currently sitting on top of the stack.</li>
        <li><b>Undo history</b> - every action gets pushed onto the stack; hitting "undo" pops the most recent one back off.</li>
        <li><b>The call stack itself</b> - every method call pushes a new frame onto a stack, and every time a method returns, its frame gets popped. This is also exactly why deep, unbounded recursion crashes with a <code>StackOverflowException</code> -- you've pushed more frames than there's room for.</li>
        <li><b>Depth-first search (DFS)</b> - either explicitly, using a <code>Stack&lt;T&gt;</code> yourself, or implicitly through recursion (which is really just letting the call stack act as your stack).</li>
      </ul>
      <h4>Implementation options</h4>
      <p>A stack can be built on top of a resizing array (push/pop at the end -- <code>O(1)</code>, which is exactly what C#'s built-in <code>Stack&lt;T&gt;</code> already does) or on top of a linked list (push/pop at the head -- also <code>O(1)</code>, and it never needs to resize anything). Either way, every core operation stays <code>O(1)</code>; which one you'd pick mostly comes down to memory overhead and whether you need to cap the maximum size.</p>
    `,
  },

  {
    slug: 'queue',
    title: '10. Queues',
    contentHtml: `
      <h4>First In, First Out (FIFO)</h4>
      <p>Picture a line at a store: whoever got in line first is the first one served. That's a queue. Core operations:</p>
      <ul>
        <li><code>Enqueue(x)</code> - add <code>x</code> to the back of the line</li>
        <li><code>Dequeue()</code> - remove and return whoever's at the front of the line</li>
      </ul>
      <pre><code>Queue<int> queue = new Queue<int>();
queue.Enqueue(1);
queue.Enqueue(2);
int front = queue.Dequeue(); // 1 -- first one in, first one out</code></pre>
      <p>Both operations should be <code>O(1)</code> -- but only <i>if</i> the queue is implemented correctly. A naive version built by shifting every remaining element left after removing the front one is actually <code>O(n)</code> per dequeue, which defeats the point. Two common fixes avoid that (and this is exactly what C#'s built-in <code>Queue&lt;T&gt;</code> does internally):</p>
      <ul>
        <li><b>Circular buffer</b> - a fixed-size array with separate <code>front</code> and <code>rear</code> markers that wrap back around to the start when they hit the end, so nothing ever needs to shift.</li>
        <li><b>Linked list</b> - keep a pointer to both the <code>head</code> and the <code>tail</code>; enqueue appends at the tail, dequeue removes from the head, and both stay <code>O(1)</code>.</li>
      </ul>
      <h4>The "queue from two stacks" trick</h4>
      <p>Here's a fun one: you can build a fully working queue out of nothing but two stacks. It's a common interview exercise, and a nice concrete illustration of "amortized" cost (see the Lists topic for that term):</p>
      <pre><code>public class MyQueue
{
    private Stack<int> inStack = new Stack<int>();
    private Stack<int> outStack = new Stack<int>();

    public void Push(int x) => inStack.Push(x);

    public int Pop()
    {
        if (outStack.Count == 0)
        {
            // move everything over, reversing its order in the process
            while (inStack.Count > 0) outStack.Push(inStack.Pop());
        }
        return outStack.Pop();
    }
}</code></pre>
      <p><code>Push</code> is always <code>O(1)</code>. <code>Pop</code> looks like it might be <code>O(n)</code> at first glance, since it can move everything from <code>inStack</code> over to <code>outStack</code> -- but each individual element only ever makes that move <i>once</i> in its entire lifetime in the queue. Spread that cost out over many operations ("amortized," again), and <code>Pop</code> also works out to <code>O(1)</code> on average.</p>
      <h4>Classic uses</h4>
      <p>Task or print-job scheduling, and <b>breadth-first search (BFS)</b> -- process every node in the current "layer," adding their neighbors to the queue to become the next layer. That's exactly what gives BFS its level-by-level exploration order, as opposed to DFS's stack-driven, dive-as-deep-as-possible-first order.</p>
    `,
  },

  {
    slug: 'dictionaries',
    title: '11. Dictionaries (Hash Maps)',
    contentHtml: `
      <h4>Key-value storage</h4>
      <p>A dictionary (also called a hash map) stores <b>key-value pairs</b> -- like a real dictionary, where you look up a word (the key) to get its definition (the value). The huge advantage is speed: getting, setting, or deleting by key takes <code>O(1)</code> time <i>on average</i>, versus <code>O(n)</code> if you had to scan through a plain array of pairs looking for a matching key. In C#, this is <code>Dictionary&lt;TKey, TValue&gt;</code>:</p>
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
      <p>Internally, a <b>hash function</b> (in C#, this happens via <code>GetHashCode()</code>) turns each key into a number. That number picks which "bucket" (slot) in an underlying array to store that key-value pair in. Looking a key up later just means: run it through the same hash function, jump straight to that bucket, and check what's sitting there -- no scanning needed at all. Occasionally two different keys will hash to the same bucket (called a <b>collision</b>); implementations deal with this either by keeping a small list of entries in each bucket ("chaining") or by finding the next open bucket instead ("open addressing"). As long as the hash function spreads keys out fairly evenly, collisions stay rare enough that everything stays <code>O(1)</code> on average -- though in a worst-case scenario (say, someone deliberately crafting keys designed to all collide), performance can degrade toward <code>O(n)</code>.</p>
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
      <p>Any time you catch yourself writing a nested loop just to check "does some other element satisfy X," stop and ask whether a dictionary (or its close cousin <code>HashSet&lt;T&gt;</code>, for when you only care whether you've seen something before, not a value attached to it) could turn that into a single pass instead. The classic example is Two Sum: instead of checking every possible pair of numbers (<code>O(n&sup2;)</code>), remember every number you've already seen in a dictionary as you go, so asking "have I already seen the complement I need?" becomes a single <code>O(1)</code> lookup:</p>
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
      <p>This turns an <code>O(n&sup2;)</code> brute-force approach into just <code>O(n)</code> time, at the cost of using <code>O(n)</code> extra space for the dictionary -- almost always a trade worth making.</p>
    `,
  },

  {
    slug: 'linked-lists',
    title: 'Linked Lists',
    contentHtml: `
      <h4>Nodes and links</h4>
      <p>A linked list is a chain of <b>nodes</b>, where each node holds one value plus a reference (a pointer) to the next node in the chain. Unlike an array, the nodes are <i>not</i> sitting next to each other in memory -- each one can live anywhere, and the only way to reach node <code>i</code> is to start at the front and walk the chain, one link at a time. That makes indexed access <code>O(n)</code>, unlike an array's <code>O(1)</code>.</p>
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
      <p>(C# also has a ready-made doubly linked list built in, <code>System.Collections.Generic.LinkedList&lt;T&gt;</code>, if you don't need to build the node type yourself.)</p>
      <h4>Why use one anyway, if indexing is slower?</h4>
      <ul>
        <li>Inserting or removing at the <b>front</b> is <code>O(1)</code> -- nothing needs to shift, unlike an array, where everything after the front has to move over.</li>
        <li>It can grow to any size without ever needing to reallocate and copy everything, the way a resizing array occasionally has to.</li>
        <li>A <i>doubly</i> linked list also keeps a <code>Prev</code> pointer on each node, which lets you remove a node you already have a reference to in <code>O(1)</code>, without having to walk from the head to find it first.</li>
      </ul>
      <h4>Classic patterns</h4>
      <ul>
        <li><b>Fast/slow pointers</b> (also called Floyd's algorithm) - walk one pointer through the list twice as fast as the other. This finds the middle node in one pass, and can also detect whether the list loops back on itself (a cycle), since the two pointers will eventually land on the same node if there's a loop.</li>
        <li><b>Reversal</b> - walk the list exactly once, and as you go, point each node's <code>Next</code> back at the node before it instead of the one after it.</li>
      </ul>
    `,
  },
];

module.exports = { notes };
