// Learning notes shown in the Notes section. An ordered list of topics
// (independent of the problems categories) matching the course's actual
// topic order. Static reference content -- no DB storage needed. Code
// examples are in C#, matching the DSTALGO course itself (the practice
// judge on this site runs JavaScript for sandboxing reasons -- see the
// README -- but the reference material here follows the course language).
//
// Written W3Schools-style for beginners: short paragraphs, one idea at a
// time, lots of small progressively-building "Example" blocks instead of
// one big block of code, Note/Tip callouts for side facts, and a "Key
// Takeaways" recap box at the end of every topic. Jargon (contiguous,
// amortized, etc.) is always defined in plain words the first time it
// shows up, never assumed.

const notes = [
  {
    slug: 'single-dimension-array',
    title: '1. Single-Dimension Arrays',
    contentHtml: `
      <h4>What is an array?</h4>
      <p>An array is a container that holds a fixed number of values, all of the <i>same type</i>, in a specific order.</p>
      <p>Think of an array like a row of numbered lockers. Each locker holds one item. Each locker has a number on it, called an <b>index</b>. You use the index to open (read or change) exactly the locker you want, instantly, without opening any of the others first.</p>
      <p>Indexes always start at <code>0</code>, not <code>1</code>. So an array with 5 boxes has indexes <code>0, 1, 2, 3, 4</code> -- there is no box <code>5</code>. This trips up almost everyone the first time, so it's worth saying twice: the <i>first</i> element is at index <code>0</code>, and the <i>last</i> element is at index <code>Length - 1</code>.</p>
      <pre><code>index:     0    1    2    3    4
value:  [ 10,  20,  30,  40,  50 ]</code></pre>

      <h4>Creating an array in C#</h4>
      <p>In C#, you must decide the type of the elements and, one way or another, how many elements there are. Arrays cannot change size after they're created -- if you need something that grows, see the Lists topic later on.</p>
      <div class="example-label">Example 1: creating and reading an array</div>
      <pre><code>int[] arr = { 10, 20, 30, 40, 50 };
int x = arr[2];       // 30 -- box number 2, which is the 3rd box
int len = arr.Length;  // 5</code></pre>
      <div class="note-callout"><p><b>Note:</b> for arrays, the property is called <code>Length</code>. Later, for <code>List&lt;T&gt;</code>, it's called <code>Count</code> instead. Mixing these two up is a very common beginner mistake -- the compiler will simply tell you the property doesn't exist.</p></div>

      <div class="example-label">Example 2: changing a value</div>
      <pre><code>int[] arr = { 10, 20, 30 };
arr[1] = 99; // overwrite index 1
// arr is now { 10, 99, 30 }</code></pre>

      <div class="example-label">Example 3: looping over every element</div>
      <pre><code>int[] arr = { 10, 20, 30, 40, 50 };
for (int i = 0; i < arr.Length; i++)
{
    Console.WriteLine(arr[i]);
}
// prints 10, then 20, then 30, then 40, then 50, one per line</code></pre>
      <p>You can also loop with <code>foreach</code> when you just want each value and don't need the index:</p>
      <pre><code>foreach (int value in arr)
{
    Console.WriteLine(value);
}</code></pre>

      <h4>Why is <code>arr[i]</code> so fast?</h4>
      <p>Reading <code>arr[i]</code> takes the same amount of time no matter how big the array is, or which index you ask for. That might seem surprising -- how does it not need to "search" for the right box?</p>
      <p>The reason is how arrays are stored in memory: every box sits directly next to the one before it, with no gaps in between. This is called <b>contiguous</b> storage (a fancy word that just means "touching, in one unbroken row"). Because of that, the computer can find any box with simple math: "start of the array, plus <code>i</code> boxes over." No searching, no walking through earlier boxes -- just arithmetic. That's why array access is considered instant.</p>
      <div class="note-callout"><p><b>Note:</b> that same tightly-packed layout is also an array's biggest weakness. Because there are no gaps, inserting or removing a box anywhere except the very end means every later box has to slide over by one, to close (or open) the gap. More on this below.</p></div>

      <h4>Big-O notation: a way to talk about "how slow"</h4>
      <p>As your programs handle bigger inputs -- more items in a list, more users, more rows in a file -- some ways of writing code stay fast, and some slow down a lot. <b>Big-O notation</b> is a simple shorthand for describing that: as the input size (usually called <code>n</code>) grows, how much more work does the algorithm do?</p>
      <p>Big-O deliberately ignores things like "how fast is this specific computer." That makes it a fair way to compare two different approaches to the same problem, on paper, before you've even run either one.</p>
      <ul>
        <li><code>O(1)</code> - "constant time." The amount of work never changes, whether <code>n</code> is 10 or 10 million. Reading <code>arr[i]</code> is like this.</li>
        <li><code>O(log n)</code> - the problem gets cut roughly in half every step, so the work barely grows even as <code>n</code> gets huge. Binary search (next topic) works this way.</li>
        <li><code>O(n)</code> - one pass over everything. Double the input, and the work roughly doubles too. Linear search, summing an array.</li>
        <li><code>O(n log n)</code> - a little more than one pass, but still very manageable. Most good general-purpose sorting algorithms land here.</li>
        <li><code>O(n&sup2;)</code> - roughly "for every item, look at every other item" -- nested loops over the same input. Selection sort and insertion sort's worst case both land here.</li>
      </ul>

      <div class="example-label">Example 4: seeing the gap for yourself</div>
      <p>For <code>n = 1,000</code> items, at roughly a billion operations per second, here's how much work each category does:</p>
      <pre><code>O(log n)   ~10 operations       -- effectively instant
O(n)       ~1,000 operations    -- effectively instant
O(n log n) ~10,000 operations   -- effectively instant
O(n&sup2;)     ~1,000,000 operations -- still instant</code></pre>
      <p>At <code>n = 1,000</code> the difference doesn't even matter -- everything feels instant. But watch what happens at <code>n = 1,000,000</code>:</p>
      <pre><code>O(n log n) ~20,000,000 operations   -- milliseconds
O(n&sup2;)     ~1,000,000,000,000 operations -- minutes</code></pre>
      <p>An <code>O(n&sup2;)</code> algorithm suddenly needs a <i>trillion</i> operations on the exact same kind of input that an <code>O(n log n)</code> algorithm finishes in milliseconds. And buying a faster computer doesn't fix this -- a faster CPU only speeds everything up by the same fixed multiplier. It can never turn an <code>O(n&sup2;)</code> algorithm into an <code>O(n log n)</code> one. Only a better algorithm can do that.</p>

      <h4>Reading Big-O directly from code</h4>
      <p>Three simple rules cover almost every case you'll run into as a beginner:</p>
      <ul>
        <li><b>Separate loops add.</b> A loop of <code>n</code>, followed by another separate loop of <code>n</code>, is still just <code>O(n)</code> overall -- it does <i>not</i> become <code>O(n&sup2;)</code>.</li>
        <li><b>Nested loops multiply.</b> A loop of <code>n</code> containing another loop of <code>n</code> is <code>O(n&sup2;)</code>.</li>
        <li><b>Drop constants and small terms.</b> Once <code>n</code> is large enough, <code>O(2n + 5)</code> is just written as <code>O(n)</code>, and <code>O(n&sup2; + n)</code> is just written as <code>O(n&sup2;)</code> -- because the <code>n&sup2;</code> part completely swamps the <code>n</code> part.</li>
      </ul>

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
        <li><b>Off-by-one errors.</b> Is the loop bound <code>&lt; arr.Length</code> or <code>&lt;= arr.Length</code>? This is the single most common source of array bugs, for beginners and experts alike. In C#, reading one box past the end doesn't quietly give you garbage -- it throws an <code>IndexOutOfRangeException</code> and crashes right away, which is actually a helpful safety net while you're learning.</li>
        <li><b>Changing an array while looping over it.</b> Removing an element mid-loop shifts every later index down by one. This can silently make you skip the element that slides into the spot you were just at.</li>
        <li><b>Confusing "sorted" with "in the order I put things in."</b> Binary search only works on sorted data. Running it on unsorted data doesn't just make it slow -- it gives you a flat-out wrong answer, with no warning that anything went wrong.</li>
      </ul>

      <div class="takeaways">
        <p>Key Takeaways</p>
        <ul>
          <li>An array is a fixed-size, numbered row of same-type values. Indexes start at <code>0</code>.</li>
          <li><code>arr[i]</code> is <code>O(1)</code> because array elements sit contiguously in memory, so the address can be computed with simple math.</li>
          <li>Big-O describes how work grows with input size <code>n</code>, ignoring hardware speed -- from best (<code>O(1)</code>) to worst of these (<code>O(n&sup2;)</code>).</li>
          <li>Inserting or removing in the middle of an array costs <code>O(n)</code>, because everything after it must shift.</li>
        </ul>
      </div>
    `,
  },

  {
    slug: 'linear-search',
    title: '2. Linear Search',
    contentHtml: `
      <h4>What is linear search?</h4>
      <p>Linear search is the most obvious way to find a value in an array: start at index <code>0</code>, and check each element one at a time. Stop as soon as you find the target, or keep going until you run out of elements.</p>
      <p>It doesn't matter whether the array is sorted or not -- linear search works on any array at all. That's its biggest strength, and also why it's usually the fallback choice when nothing faster is available.</p>

      <div class="example-label">Example 1: basic linear search</div>
      <pre><code>public static int LinearSearch(int[] arr, int target)
{
    for (int i = 0; i < arr.Length; i++)
    {
        if (arr[i] == target) return i; // found it -- report the index
    }
    return -1; // walked the whole array, never found it
}</code></pre>

      <div class="example-label">Example 2: tracing it by hand</div>
      <pre><code>arr = [4, 2, 9, 6], target = 9

i=0: arr[0]=4, not a match, keep going
i=1: arr[1]=2, not a match, keep going
i=2: arr[2]=9, match! return 2</code></pre>
      <p>Try tracing <code>target = 7</code> on the same array yourself -- the loop checks every element, never finds a match, and returns <code>-1</code>.</p>

      <div class="note-callout"><p><b>Note:</b> returning <code>-1</code> to mean "not found" is a common convention in C#, since <code>-1</code> is never a valid array index. Just make sure whoever calls the function knows to check for it.</p></div>

      <h4>Complexity</h4>
      <ul>
        <li><b>Best case:</b> <code>O(1)</code> -- you get lucky and the target is the very first element.</li>
        <li><b>Worst case:</b> <code>O(n)</code> -- the target is last, or isn't in the array at all. In that case you still have to check every element to be sure it's really missing.</li>
        <li><b>Average case:</b> <code>O(n)</code> -- on average, you'll check about half the array before finding it.</li>
        <li><b>Space:</b> <code>O(1)</code> -- no extra memory needed beyond the loop counter, no matter how big the array is.</li>
      </ul>

      <h4>When is it the right choice?</h4>
      <p>Reach for linear search whenever the data isn't sorted, and it's not worth the effort to sort it first -- for example, if you're only going to search once. It's also simply the only option on data structures that don't let you jump around freely, like a linked list (covered later), where you can't "skip to the middle" the way binary search needs to.</p>

      <div class="tip-callout"><p><b>Tip:</b> if you find yourself searching the <i>same</i> array over and over, it's usually worth sorting it once up front and switching to binary search instead. One sort pays for itself quickly once you're doing many searches.</p></div>

      <div class="takeaways">
        <p>Key Takeaways</p>
        <ul>
          <li>Linear search checks every element in order until it finds a match or runs out.</li>
          <li>It works on any array, sorted or not -- but it's <code>O(n)</code> in the worst and average case.</li>
          <li>Use it for one-off searches, or whenever the data isn't sorted and can't easily be.</li>
        </ul>
      </div>
    `,
  },

  {
    slug: 'binary-search',
    title: '3. Binary Search',
    contentHtml: `
      <h4>What is binary search?</h4>
      <p>If you already know the array is <b>sorted</b>, there's a much smarter way to search than checking every element one by one.</p>
      <p>Think about looking up a name in a phone book. You don't start at page 1 and read every name. Instead, you flip to roughly the middle, check whether the name you want comes before or after that page, and repeat on just that half. Binary search does exactly this to a sorted array.</p>
      <p>Each comparison throws away half of what's left to search. Cutting the search space in half, over and over, is what makes binary search <code>O(log n)</code> instead of <code>O(n)</code>.</p>

      <div class="example-label">Example 1: the algorithm</div>
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
      <div class="note-callout"><p><b>Note:</b> C# actually has this built in as <code>Array.BinarySearch(arr, target)</code>, which does exactly this on a sorted array. It's worth knowing that exists for real code -- but writing binary search yourself, at least once, is how the idea really sinks in.</p></div>

      <div class="example-label">Example 2: worked trace, step by step</div>
      <p>Here's the algorithm above running on a real array, one step at a time:</p>
      <pre><code>arr = [1, 3, 5, 7, 9, 11, 13], target = 9

lo=0, hi=6, mid=3 -> arr[3]=7 < 9  -> search right half, lo=4
lo=4, hi=6, mid=5 -> arr[5]=11 > 9 -> search left half,  hi=4
lo=4, hi=4, mid=4 -> arr[4]=9 == 9 -> found at index 4</code></pre>
      <p>Just three comparisons found the answer, in a 7-element array. That might not sound impressive yet -- but the payoff shows up at scale.</p>

      <div class="example-label">Example 3: why it scales so well</div>
      <pre><code>Array size        Comparisons needed (roughly)
--------------------------------------------
7 elements         3
1,000 elements      10
1,000,000 elements   20
1,000,000,000 elements  30</code></pre>
      <p>Doubling the array size only ever adds <i>one more</i> comparison. That's the power of <code>O(log n)</code>.</p>

      <h4>Complexity</h4>
      <p>Best case is <code>O(1)</code> (the target happens to be the middle element right away). Worst and average case are both <code>O(log n)</code>. Space is <code>O(1)</code> extra for the loop version shown above (or <code>O(log n)</code> if you write it recursively instead, since each recursive call adds a frame to the call stack -- see the Stacks topic for what that means).</p>

      <h4>The catch, and common bugs</h4>
      <ul>
        <li><b>It requires sorted input.</b> Run it on unsorted data and it won't warn you, and it won't even be slow -- it will just confidently hand back a wrong answer.</li>
        <li><b>Off-by-one mistakes in the bounds</b> are the classic bug here. Using <code>lo &lt; hi</code> instead of <code>lo &lt;= hi</code>, or forgetting to move past <code>mid</code> (writing <code>lo = mid</code> instead of <code>lo = mid + 1</code>), can cause an infinite loop or make you miss the target entirely.</li>
        <li>Computing the midpoint as <code>(lo + hi) / 2</code> can technically overflow on very large arrays in some languages. Writing it as <code>lo + (hi - lo) / 2</code> avoids that, and is worth building as a habit even before it actually matters.</li>
        <li>If you'd have to sort the array first, and you're only searching it once or twice, that sorting cost might outweigh what you save. Binary search really pays off when you search the <i>same</i> sorted collection over and over.</li>
      </ul>

      <div class="takeaways">
        <p>Key Takeaways</p>
        <ul>
          <li>Binary search only works on <b>sorted</b> data.</li>
          <li>It repeatedly checks the middle element and discards the half that can't contain the target.</li>
          <li>It runs in <code>O(log n)</code>, which scales extremely well -- doubling the array only adds one more comparison.</li>
        </ul>
      </div>
    `,
  },

  {
    slug: 'selection-sort',
    title: '4. Selection Sort',
    contentHtml: `
      <h4>What is selection sort?</h4>
      <p>Selection sort builds up a sorted array one element at a time, from the front. On each pass, it looks through whatever part of the array isn't sorted yet, finds the <i>smallest</i> value in that unsorted part, and swaps it into the next open slot.</p>
      <p>After <code>k</code> passes, the first <code>k</code> elements of the array are guaranteed to be the <code>k</code> smallest values overall, already sitting in the correct order.</p>

      <div class="example-label">Example 1: sorting [5, 3, 8, 4] by hand</div>
      <pre><code>[5, 3, 8, 4]
find min of [5,3,8,4] = 3 at index 1 -> swap with index 0 -> [3, 5, 8, 4]
find min of [5,8,4]   = 4 at index 3 -> swap with index 1 -> [3, 4, 8, 5]
find min of [8,5]     = 5 at index 3 -> swap with index 2 -> [3, 4, 5, 8]
Result: [3, 4, 5, 8]</code></pre>

      <div class="example-label">Example 2: the code</div>
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
      <p>Notice the two loops: the outer loop picks which slot we're filling next, and the inner loop scans the rest of the array to find what belongs there. A loop inside a loop, over the same array, is exactly the pattern that leads to <code>O(n&sup2;)</code> -- see the Big-O rules in the Arrays topic.</p>

      <h4>Complexity</h4>
      <p>This is <code>O(n&sup2;)</code> in <i>every</i> case -- best, average, and worst. That's because finding the minimum of the remaining unsorted part always means scanning all of it, no matter how sorted the array already happens to be. This is its main weakness compared to insertion sort (the next topic), which can finish much faster, in <code>O(n)</code>, when the input is already nearly sorted.</p>
      <p>Its one real advantage: the number of <b>swaps</b> is only <code>O(n)</code> total -- just one swap per pass, not one per comparison. That's useful in situations where actually writing to memory is much more expensive than comparing values.</p>
      <div class="note-callout"><p><b>Note:</b> as written above, selection sort is <b>not stable</b> -- a swap can occasionally jump an element past another equal element, changing their original relative order. It <i>is</i> <b>in-place</b>, meaning it needs no extra memory beyond the array itself (<code>O(1)</code> extra space).</p></div>

      <div class="takeaways">
        <p>Key Takeaways</p>
        <ul>
          <li>Selection sort repeatedly finds the minimum of the unsorted remainder and swaps it into place.</li>
          <li>Always <code>O(n&sup2;)</code>, regardless of how sorted the input already is.</li>
          <li>Uses very few swaps (<code>O(n)</code> total), which can matter when writes are expensive.</li>
        </ul>
      </div>
    `,
  },

  {
    slug: 'insertion-sort',
    title: '5. Insertion Sort',
    contentHtml: `
      <h4>What is insertion sort?</h4>
      <p>This is the way most people naturally sort a hand of playing cards. You keep a sorted pile in your hand, and for each new card you pick up, you slide it left past every card that's bigger, until it lands in the right spot.</p>
      <p>Insertion sort does exactly this to an array. It keeps a growing "sorted prefix" at the front of the array, and for each new element, slides it left past everything bigger, until it lands in place.</p>

      <div class="example-label">Example 1: sorting [5, 3, 8, 4] by hand</div>
      <pre><code>[5, 3, 8, 4]
sorted prefix [5] | take 3: slide left past 5     -> [3, 5, 8, 4]
sorted prefix [3,5] | take 8: already >= 5, stays -> [3, 5, 8, 4]
sorted prefix [3,5,8] | take 4: slide past 8, 5    -> [3, 4, 5, 8]
Result: [3, 4, 5, 8]</code></pre>

      <div class="example-label">Example 2: the code</div>
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
      <p>Both are <code>O(n&sup2;)</code> in general, but they behave very differently on data that's <i>already close to sorted</i>:</p>
      <ul>
        <li>Selection sort always does the same full amount of work, no matter what the input looks like.</li>
        <li>Insertion sort adapts -- the closer the input already is to sorted, the closer it gets to running in <code>O(n)</code>.</li>
      </ul>
      <div class="tip-callout"><p><b>Tip:</b> this is exactly why real-world sorting libraries fall back to insertion sort (not selection sort) for small chunks of data. Timsort (used by Python, and by .NET/Java's sort for reference types) and other hybrid sorts switch over to insertion sort once a section gets small, because its low overhead and ability to take advantage of near-sorted data beats fancier <code>O(n log n)</code> algorithms at that scale.</p></div>
      <p>Insertion sort is <b>stable</b> (equal elements never slide past each other, so their original order is preserved) and <b>in-place</b>.</p>

      <div class="takeaways">
        <p>Key Takeaways</p>
        <ul>
          <li>Insertion sort builds a sorted prefix, sliding each new element into its correct spot within it.</li>
          <li><code>O(n&sup2;)</code> worst case, but <code>O(n)</code> best case on nearly-sorted input -- unlike selection sort.</li>
          <li>Stable and in-place, and used as the small-input fallback inside many real sorting libraries.</li>
        </ul>
      </div>
    `,
  },

  {
    slug: 'jagged-array',
    title: '6. Jagged Arrays',
    contentHtml: `
      <h4>What makes an array "jagged"?</h4>
      <p>A jagged array is an "array of arrays," where each inner array is allowed to be a <i>different</i> length. There's no requirement that the rows line up into a neat rectangle -- unlike a true 2D array, which is the next topic.</p>
      <p>The name comes from how it looks if you draw it out: the rows don't line up evenly on the right-hand side, like the jagged edge of a torn piece of paper.</p>

      <div class="example-label">Example 1: creating a jagged array</div>
      <pre><code>int[][] jagged = new int[3][];
jagged[0] = new int[] { 1, 2, 3 };
jagged[1] = new int[] { 4 };
jagged[2] = new int[] { 5, 6 };</code></pre>
      <p>Compare that to a true rectangular 2D array, which uses a comma inside the brackets instead of a second set of brackets:</p>
      <div class="example-label">Example 2: a rectangular 2D array, for comparison</div>
      <pre><code>int[,] grid = new int[3, 3]
{
    { 1, 2, 3 },
    { 4, 5, 6 },
    { 7, 8, 9 },
};</code></pre>
      <div class="note-callout"><p><b>Note:</b> <code>int[][]</code> (jagged) and <code>int[,]</code> (rectangular) are genuinely different types in C#. You can't mix them up and expect the compiler to sort it out for you.</p></div>

      <h4>Why would you want one?</h4>
      <p>Use a jagged array whenever the data naturally isn't rectangular. Some real examples:</p>
      <ul>
        <li>Each student in a class has a different number of grades.</li>
        <li>Each row of a triangle-shaped table has one more or fewer element than the last.</li>
        <li>A graph where each node has a different number of neighbors (see the graph-related problems for this).</li>
      </ul>
      <p>Forcing data like that into a rectangular array would waste memory on empty padding, or force you to invent a placeholder value to mean "nothing here."</p>

      <div class="example-label">Example 3: looping over a jagged array</div>
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
        <li>A jagged array can contain an empty row (<code>new int[0]</code>), or a row that was never assigned anything at all (<code>null</code>). Every row in a freshly created <code>int[][]</code> starts out as <code>null</code> until you explicitly assign it. Code that assumes every row is ready to use can throw a <code>NullReferenceException</code> if it hits a row that was never set up.</li>
      </ul>

      <div class="takeaways">
        <p>Key Takeaways</p>
        <ul>
          <li>A jagged array is an array of arrays, where each row can have a different length.</li>
          <li>Written <code>int[][]</code> in C#, distinct from the rectangular <code>int[,]</code>.</li>
          <li>Watch for <code>null</code> rows that were never assigned.</li>
        </ul>
      </div>
    `,
  },

  {
    slug: 'multi-dimensional-array',
    title: '7. Multi-Dimensional Arrays',
    contentHtml: `
      <h4>What is a 2D array?</h4>
      <p>A true 2D array is a rectangular grid, like a spreadsheet -- every row has exactly the same length. In C# this is the <code>int[,]</code> form, different from the jagged <code>int[][]</code> from the last topic.</p>

      <div class="example-label">Example 1: creating and reading a 2D array</div>
      <pre><code>int[,] matrix = new int[,]
{
    { 1, 2, 3 },
    { 4, 5, 6 },
    { 7, 8, 9 },
};
int value = matrix[1, 2]; // 6 -- row 1, column 2 (note the comma, not [1][2])
int rows = matrix.GetLength(0); // 3
int cols = matrix.GetLength(1); // 3</code></pre>
      <div class="note-callout"><p><b>Note:</b> a 2D array is stored as one single block of memory, laid out row by row. Because of that layout, looping row-first (outer loop walks the rows, inner loop walks the columns) tends to be faster in practice than looping column-first, since values in the same row also sit next to each other in memory -- and reading things that are near each other in memory is cheaper than jumping around.</p></div>

      <h4>Common pattern: transposing</h4>
      <p>Transposing means flipping rows and columns, so row 1 becomes column 1, row 2 becomes column 2, and so on.</p>
      <div class="example-label">Example 2: transposing a matrix</div>
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

      <h4>Common pattern: spiral traversal</h4>
      <p>Walk the outer ring of the grid left-to-right, then top-to-bottom, then right-to-left, then bottom-to-top, shrinking the boundary inward by one after each side, and keep repeating until there's nothing left inside the boundary.</p>
      <div class="example-label">Example 3: spiral order</div>
      <pre><code>[[1,2,3],
 [4,5,6],   -> spiral order: 1, 2, 3, 6, 9, 8, 7, 4, 5
 [7,8,9]]</code></pre>

      <h4>3D and beyond</h4>
      <p>C# does support higher-dimension rectangular arrays too (<code>int[,,]</code> for 3D, and so on). But once you go past 2D or 3D, it gets a lot harder to picture what's going on. At that point it's worth asking whether a flatter structure would actually be simpler -- for example, a single 1D array with some index math, or a dictionary keyed by coordinates (see the Dictionaries topic).</p>

      <div class="takeaways">
        <p>Key Takeaways</p>
        <ul>
          <li>A true 2D array (<code>int[,]</code>) is rectangular -- every row is the same length.</li>
          <li>Access it with <code>matrix[row, col]</code>, using a comma, not double brackets.</li>
          <li>Loop row-first for better performance, since rows are stored contiguously.</li>
        </ul>
      </div>
    `,
  },

  {
    slug: 'list',
    title: '8. Lists (Abstract Data Type)',
    contentHtml: `
      <h4>What vs. how: Abstract Data Types</h4>
      <p>An <b>Abstract Data Type</b> (ADT) is a way of describing a data structure by <i>what it can do</i> -- the operations it supports -- without saying anything about <i>how</i> it does them internally.</p>
      <p>A "List" ADT, for example, just promises operations like <code>Add</code>, <code>Get</code>, <code>Remove</code>, and <code>Count</code>. It deliberately doesn't say whether it's built on top of a plain array, a resizing array, or a linked list under the hood. That separation is the whole point: code written against "a List" keeps working even if you later swap out how it's actually implemented behind the scenes.</p>

      <h4>C#'s built-in List&lt;T&gt;</h4>
      <p><code>System.Collections.Generic.List&lt;T&gt;</code> is exactly this List ADT, ready to use out of the box. Under the hood it's just a plain array -- but one that automatically grows when it runs out of room.</p>

      <div class="example-label">Example 1: using a List&lt;T&gt;</div>
      <pre><code>List<int> numbers = new List<int>();
numbers.Add(10);        // O(1) amortized -- see below
numbers.Add(20);
int first = numbers[0]; // O(1), works just like an array's indexer
numbers.RemoveAt(0);    // O(n) -- everything after index 0 shifts left
Console.WriteLine(numbers.Count); // 1 -- Count, not Length, for List<T></code></pre>

      <h4>How does it grow? And what is "amortized"?</h4>
      <p>When a <code>List&lt;T&gt;</code> runs out of room, it allocates a brand-new array roughly <i>double</i> the size, and copies every existing element into it. That copying step is <code>O(n)</code> on its own -- it takes time proportional to how many elements there are.</p>
      <p>But here's the key insight: that expensive step only has to happen occasionally. Because the array keeps doubling, it only needs to resize roughly <code>O(log n)</code> times total across <code>n</code> additions. Spread that occasional expensive step out over all the cheap <code>O(1)</code> additions in between, and the <b>average</b> cost per <code>Add</code> works out to just <code>O(1)</code>.</p>
      <div class="note-callout"><p><b>Note:</b> this is called <code>O(1)</code> <i>amortized</i>. "Amortized" is just a word for "averaged out over many operations, including the occasional expensive one." You'll see this word again in the Queues topic.</p></div>

      <div class="example-label">Example 2: roughly how List&lt;T&gt; works internally</div>
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
      <div class="tip-callout"><p><b>Tip:</b> <code>List&lt;T&gt;</code> is usually the right default choice in C#, over a plain fixed-size array or a <code>LinkedList&lt;T&gt;</code>, unless you specifically need fast insertion at the front -- that's where a linked list wins (see the Linked Lists topic).</p></div>

      <div class="takeaways">
        <p>Key Takeaways</p>
        <ul>
          <li>An ADT defines behavior (what operations exist), not implementation (how they work internally).</li>
          <li><code>List&lt;T&gt;</code> is a growable array: <code>O(1)</code> indexed access, <code>O(1)</code> amortized append.</li>
          <li>"Amortized" means the average cost per operation, once occasional expensive resizes are spread out.</li>
        </ul>
      </div>
    `,
  },

  {
    slug: 'stack',
    title: '9. Stacks',
    contentHtml: `
      <h4>Last In, First Out (LIFO)</h4>
      <p>Picture a stack of plates. You can only ever add a plate to the top, or take a plate off the top -- never from the middle or the bottom. That's a stack. The last plate you put on is the first one you'll take off, which is why this rule is called <b>LIFO</b>: Last In, First Out.</p>

      <div class="example-label">Example 1: the three core operations</div>
      <pre><code>Stack<int> stack = new Stack<int>();
stack.Push(1);      // [1]
stack.Push(2);      // [1, 2]
int top = stack.Peek(); // 2, stack unchanged
int popped = stack.Pop(); // 2, stack is now [1]</code></pre>
      <ul>
        <li><code>Push(x)</code> - add <code>x</code> to the top. <code>O(1)</code>.</li>
        <li><code>Pop()</code> - remove and return the top element. <code>O(1)</code>.</li>
        <li><code>Peek()</code> - look at the top element without removing it. <code>O(1)</code>.</li>
      </ul>

      <h4>Classic uses</h4>
      <ul>
        <li><b>Matching parentheses/brackets</b> - push every opening bracket you see; when you hit a closing bracket, it must match whatever's currently sitting on top of the stack.</li>
        <li><b>Undo history</b> - every action gets pushed onto the stack; hitting "undo" pops the most recent one back off.</li>
        <li><b>The call stack itself</b> - every method call pushes a new frame onto a stack, and every time a method returns, its frame gets popped. This is also exactly why deep, unbounded recursion crashes with a <code>StackOverflowException</code> -- you've pushed more frames than there's room for.</li>
        <li><b>Depth-first search (DFS)</b> - either explicitly, using a <code>Stack&lt;T&gt;</code> yourself, or implicitly through recursion (which is really just letting the call stack act as your stack).</li>
      </ul>

      <div class="example-label">Example 2: matching brackets using a stack</div>
      <pre><code>public static bool IsBalanced(string s)
{
    var stack = new Stack<char>();
    foreach (char c in s)
    {
        if (c == '(') stack.Push(c);
        else if (c == ')')
        {
            if (stack.Count == 0) return false; // closing with nothing open
            stack.Pop();
        }
    }
    return stack.Count == 0; // everything that opened also closed
}
// IsBalanced("(())") -> true
// IsBalanced("(()")  -> false</code></pre>

      <h4>Implementation options</h4>
      <p>A stack can be built on top of a resizing array (push/pop at the end -- <code>O(1)</code>, which is exactly what C#'s built-in <code>Stack&lt;T&gt;</code> already does) or on top of a linked list (push/pop at the head -- also <code>O(1)</code>, and it never needs to resize anything). Either way, every core operation stays <code>O(1)</code>.</p>

      <div class="takeaways">
        <p>Key Takeaways</p>
        <ul>
          <li>A stack is Last In, First Out: <code>Push</code> adds to the top, <code>Pop</code> removes from the top.</li>
          <li>All core operations are <code>O(1)</code>.</li>
          <li>Used for bracket matching, undo history, the call stack, and DFS.</li>
        </ul>
      </div>
    `,
  },

  {
    slug: 'queue',
    title: '10. Queues',
    contentHtml: `
      <h4>First In, First Out (FIFO)</h4>
      <p>Picture a line at a store. Whoever got in line first is the first one served. That's a queue -- this rule is called <b>FIFO</b>: First In, First Out.</p>

      <div class="example-label">Example 1: the core operations</div>
      <pre><code>Queue<int> queue = new Queue<int>();
queue.Enqueue(1);
queue.Enqueue(2);
int front = queue.Dequeue(); // 1 -- first one in, first one out</code></pre>
      <ul>
        <li><code>Enqueue(x)</code> - add <code>x</code> to the back of the line. <code>O(1)</code>.</li>
        <li><code>Dequeue()</code> - remove and return whoever's at the front of the line. <code>O(1)</code>.</li>
      </ul>

      <div class="note-callout"><p><b>Note:</b> both operations should be <code>O(1)</code> -- but only <i>if</i> the queue is implemented correctly. A naive version built by shifting every remaining element left after removing the front one is actually <code>O(n)</code> per dequeue, which defeats the point. C#'s built-in <code>Queue&lt;T&gt;</code> avoids this with a circular buffer internally (a fixed-size array with wrap-around front/rear markers, so nothing ever needs to shift).</p></div>

      <h4>The "queue from two stacks" trick</h4>
      <p>Here's a fun one: you can build a fully working queue out of nothing but two stacks. It's a common interview exercise, and a nice concrete illustration of "amortized" cost (see the Lists topic for that term).</p>
      <div class="example-label">Example 2: a queue built from two stacks</div>
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
      <p><code>Push</code> is always <code>O(1)</code>. <code>Pop</code> looks like it might be <code>O(n)</code> at first glance, since it can move everything from <code>inStack</code> over to <code>outStack</code> -- but each individual element only ever makes that move <i>once</i> in its entire lifetime in the queue. Spread that cost out over many operations, and <code>Pop</code> also works out to <code>O(1)</code> on average -- "amortized," again.</p>

      <h4>Classic uses</h4>
      <p>Task or print-job scheduling, and <b>breadth-first search (BFS)</b>. BFS processes every node in the current "layer," adding their neighbors to the queue to become the next layer. That's exactly what gives BFS its level-by-level exploration order, as opposed to DFS's stack-driven, dive-as-deep-as-possible-first order (see the Stacks topic).</p>

      <div class="takeaways">
        <p>Key Takeaways</p>
        <ul>
          <li>A queue is First In, First Out: <code>Enqueue</code> adds to the back, <code>Dequeue</code> removes from the front.</li>
          <li>Both operations are <code>O(1)</code> when implemented correctly (circular buffer or linked list).</li>
          <li>Used for task scheduling and BFS.</li>
        </ul>
      </div>
    `,
  },

  {
    slug: 'dictionaries',
    title: '11. Dictionaries (Hash Maps)',
    contentHtml: `
      <h4>What is a dictionary?</h4>
      <p>A dictionary (also called a hash map) stores <b>key-value pairs</b> -- like a real dictionary, where you look up a word (the key) to get its definition (the value).</p>
      <p>The huge advantage is speed: getting, setting, or deleting by key takes <code>O(1)</code> time <i>on average</i>, versus <code>O(n)</code> if you had to scan through a plain array of pairs looking for a matching key.</p>

      <div class="example-label">Example 1: using a Dictionary&lt;TKey, TValue&gt;</div>
      <pre><code>Dictionary<string, int> ages = new Dictionary<string, int>();
ages["alice"] = 30;      // set (Add also works for new keys)
ages["bob"] = 25;
int aliceAge = ages["alice"]; // 30, O(1) average
bool hasCarol = ages.ContainsKey("carol"); // false
ages.Remove("bob");</code></pre>

      <div class="example-label">Example 2: avoiding a crash with TryGetValue</div>
      <pre><code>// TryGetValue avoids a KeyNotFoundException / double lookup:
if (ages.TryGetValue("alice", out int age))
{
    Console.WriteLine(age); // 30
}
else
{
    Console.WriteLine("no entry for that key");
}</code></pre>
      <div class="note-callout"><p><b>Note:</b> reading <code>ages["missing_key"]</code> directly throws a <code>KeyNotFoundException</code> if the key isn't there. <code>TryGetValue</code> checks and reads in one step, without risking a crash.</p></div>

      <h4>How does it get O(1)? Hashing.</h4>
      <p>Internally, a <b>hash function</b> (in C#, this happens via <code>GetHashCode()</code>) turns each key into a number. That number picks which "bucket" (slot) in an underlying array to store that key-value pair in.</p>
      <p>Looking a key up later just means: run it through the same hash function, jump straight to that bucket, and check what's sitting there -- no scanning needed at all.</p>
      <div class="note-callout"><p><b>Note:</b> occasionally two different keys will hash to the same bucket -- this is called a <b>collision</b>. Implementations deal with this either by keeping a small list of entries in each bucket ("chaining") or by finding the next open bucket instead ("open addressing"). As long as the hash function spreads keys out fairly evenly, collisions stay rare enough that everything stays <code>O(1)</code> on average.</p></div>

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
      <p>Any time you catch yourself writing a nested loop just to check "does some other element satisfy X," stop and ask whether a dictionary could turn that into a single pass instead.</p>
      <div class="tip-callout"><p><b>Tip:</b> if you only care whether you've seen something before, and don't need a value attached to it, use <code>HashSet&lt;T&gt;</code> instead of a <code>Dictionary&lt;K,V&gt;</code> -- same <code>O(1)</code> average lookup, without wasting space storing a value you don't need.</p></div>

      <div class="example-label">Example 3: Two Sum, the classic dictionary trick</div>
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
      <p>Instead of checking every possible pair of numbers (<code>O(n&sup2;)</code>), this remembers every number you've already seen in a dictionary as you go, so asking "have I already seen the complement I need?" becomes a single <code>O(1)</code> lookup. That turns an <code>O(n&sup2;)</code> brute-force approach into just <code>O(n)</code> time, at the cost of using <code>O(n)</code> extra space for the dictionary -- almost always a trade worth making.</p>

      <div class="takeaways">
        <p>Key Takeaways</p>
        <ul>
          <li>A dictionary stores key-value pairs with <code>O(1)</code> average get/set/delete by key.</li>
          <li>It works by hashing keys into buckets, so lookups don't need to scan anything.</li>
          <li>Use <code>TryGetValue</code> to avoid crashes, and <code>HashSet&lt;T&gt;</code> when you don't need a value.</li>
        </ul>
      </div>
    `,
  },

  {
    slug: 'linked-lists',
    title: 'Linked Lists',
    contentHtml: `
      <h4>Nodes and links</h4>
      <p>A linked list is a chain of <b>nodes</b>. Each node holds one value, plus a reference (a pointer) to the next node in the chain.</p>
      <p>Unlike an array, the nodes are <i>not</i> sitting next to each other in memory -- each one can live anywhere. The only way to reach node <code>i</code> is to start at the front and walk the chain, one link at a time. That makes indexed access <code>O(n)</code>, unlike an array's <code>O(1)</code>.</p>

      <div class="example-label">Example 1: defining a node</div>
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
      <div class="note-callout"><p><b>Note:</b> C# also has a ready-made doubly linked list built in, <code>System.Collections.Generic.LinkedList&lt;T&gt;</code>, if you don't need to build the node type yourself.</p></div>

      <div class="example-label">Example 2: building a small list by hand</div>
      <pre><code>ListNode head = new ListNode(1, new ListNode(2, new ListNode(3)));
// head -> 1 -> 2 -> 3 -> null

ListNode current = head;
while (current != null)
{
    Console.WriteLine(current.Val);
    current = current.Next;
}
// prints 1, then 2, then 3</code></pre>

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

      <div class="example-label">Example 3: reversing a linked list</div>
      <pre><code>public static ListNode Reverse(ListNode head)
{
    ListNode prev = null;
    ListNode current = head;
    while (current != null)
    {
        ListNode next = current.Next; // save it before we overwrite Next
        current.Next = prev;          // point backwards
        prev = current;               // move prev forward
        current = next;               // move current forward
    }
    return prev; // prev ends up as the new head
}</code></pre>

      <div class="takeaways">
        <p>Key Takeaways</p>
        <ul>
          <li>A linked list is a chain of nodes, each pointing to the next. Indexed access is <code>O(n)</code>.</li>
          <li>Inserting/removing at the front is <code>O(1)</code>, unlike an array's <code>O(n)</code>.</li>
          <li>Fast/slow pointers and reversal are the two patterns you'll reuse constantly.</li>
        </ul>
      </div>
    `,
  },
];

module.exports = { notes };
