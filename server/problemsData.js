// Categories and problems seeded into the site. Solutions are written and
// judged in C#, executed server-side by judge-host (see judge-host/ and
// server/csharpJudge.js) -- NOT in the browser, since arbitrary C# can't be
// sandboxed client-side the way JavaScript could in a Web Worker.
//
// Categories and problems are deliberately built to mirror the Notes
// section (server/notesData.js) topic-for-topic, in the same order:
//   1  Single-Dimension Arrays      -> Arrays & Big-O
//   2  Linear Search                -\
//   3  Binary Search                 >-> Searching
//   4  Selection Sort               -\
//   5  Insertion Sort                >-> Sorting Algorithms
//   6  Jagged Arrays                -\
//   7  Multi-Dimensional Arrays      >-> Multi-Dimensional & Jagged Arrays
//   8  Lists (Abstract Data Type)   -> Lists (Abstract Data Type)
//   9  Stacks                       -\
//   10 Queues                        >-> Stacks & Queues
//   11 Dictionaries (Hash Maps)     -> Dictionaries (Hash Maps)
//   12 Linked Lists                 -> Linked Lists
// Several problems below are the note's own worked example turned into an
// exercise (e.g. Transpose/Spiral from the Multi-Dimensional note, the
// Two Sum dictionary trick, the reversal/fast-slow-pointer patterns from
// Linked Lists), so solving them reinforces exactly what was just read.
//
// To add more problems for a category later, just append entries here and
// re-run `npm run seed` -- seeding upserts by slug, and now also deletes
// any problem/category whose slug is no longer present here (see seed.js),
// so a full rewrite like this one is reflected exactly, not just added to.

const categories = [
  { slug: 'arrays-big-o', name: 'Arrays & Big-O', order_index: 1,
    description: 'Working with 1D arrays and reasoning about time/space complexity.' },
  { slug: 'searching', name: 'Searching', order_index: 2,
    description: 'Linear search and binary search, and the classic problems built on top of them.' },
  { slug: 'sorting', name: 'Sorting Algorithms', order_index: 3,
    description: 'Selection sort and insertion sort, implemented and reasoned about by hand.' },
  { slug: 'multi-dimensional-arrays', name: 'Multi-Dimensional & Jagged Arrays', order_index: 4,
    description: '2D matrices and jagged (ragged) arrays.' },
  { slug: 'arraylists-adt', name: 'Lists (Abstract Data Type)', order_index: 5,
    description: 'Dynamic array-backed lists and abstract data type operations.' },
  { slug: 'stacks-queues', name: 'Stacks & Queues', order_index: 6,
    description: 'LIFO/FIFO abstract data types, implemented from scratch.' },
  { slug: 'dictionaries', name: 'Dictionaries (Hash Maps)', order_index: 7,
    description: 'Key-value lookups, and trading space for time to turn O(n²) into O(n).' },
  { slug: 'linked-lists', name: 'Linked Lists', order_index: 8,
    description: 'Singly linked list construction and manipulation.' },
];

// ---- Driver templates -----------------------------------------------
// A "driver" is the C# code that runs after the shared prelude (see
// judge-host/Program.cs) and the problem's own preamble + the user's
// submitted code. It reads `Tests` (a JsonElement array global), calls the
// user's function/class for each test case, and must end with a bare
// expression (no semicolon) of type List<TestOutcome> -- that's what
// Roslyn scripting returns as the submission's result.

// Most problems: call one function with N positional args, compare the
// return value to `expected` directly (via JSON round-trip equality).
function defaultDriver(argBindings, callExpr, expectedType) {
  const bindings = argBindings
    .map(a => `        var ${a.name} = JudgeHelpers.Arg<${a.type}>(test, ${a.index});`)
    .join('\n');
  return `
var results = new List<TestOutcome>();
foreach (var test in Tests.EnumerateArray())
{
    try
    {
${bindings}
        var output = ${callExpr};
        var expected = JudgeHelpers.Expected<${expectedType}>(test);
        results.Add(new TestOutcome { Pass = JudgeHelpers.DeepEqualJson(output, expected), Output = output, Expected = expected });
    }
    catch (Exception ex)
    {
        results.Add(new TestOutcome { Pass = false, Error = ex.Message });
    }
}
results
`;
}

// "Design" problems: a class exercised by a sequence of operations (e.g.
// MinStack). Test shape: { args: [ops, opArgs], expected: [...] }.
function designDriver(className) {
  return `
var results = new List<TestOutcome>();
foreach (var test in Tests.EnumerateArray())
{
    try
    {
        var outputs = JudgeHelpers.RunDesignOps<${className}>(test);
        var expected = JudgeHelpers.Expected<List<object>>(test);
        results.Add(new TestOutcome { Pass = JudgeHelpers.DeepEqualJson(outputs, expected), Output = outputs, Expected = expected });
    }
    catch (Exception ex)
    {
        results.Add(new TestOutcome { Pass = false, Error = ex.Message });
    }
}
results
`;
}

const linkedListPreamble = `
public class ListNode
{
    public int Val;
    public ListNode Next;
    public ListNode(int val, ListNode next = null)
    {
        Val = val;
        Next = next;
    }
}

public static ListNode ArrayToList(int[] arr)
{
    ListNode head = null, tail = null;
    foreach (var v in arr)
    {
        var node = new ListNode(v);
        if (head == null) { head = tail = node; }
        else { tail.Next = node; tail = node; }
    }
    return head;
}

public static List<int> ListToArray(ListNode head)
{
    var result = new List<int>();
    while (head != null)
    {
        result.Add(head.Val);
        head = head.Next;
    }
    return result;
}
`;

const problems = [
  // ---- arrays-big-o (Notes topic 1: Single-Dimension Arrays) ----
  {
    slug: 'find-maximum', category: 'arrays-big-o', title: 'Find the Maximum Value', difficulty: 'Easy',
    description_html: `<p>Given an array of integers <code>nums</code>, return the maximum value in the array.</p>
<p>Aim for a single pass, O(n) time -- see the Big-O section of the Single-Dimension Arrays note.</p>
<p><b>Example:</b> <code>FindMaximum(new int[] {3,1,4,1,5,9,2,6})</code> &rarr; <code>9</code></p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'nums', type: 'int[]', index: 0 }], 'FindMaximum(nums)', 'int'),
    starter_code: `public static int FindMaximum(int[] nums)\n{\n    // your code here\n}`,
    tests: [
      { args: [[3, 1, 4, 1, 5, 9, 2, 6]], expected: 9 },
      { args: [[-5, -1, -10]], expected: -1 },
      { args: [[7]], expected: 7 },
      { args: [[2, 2, 2]], expected: 2 },
    ],
  },
  {
    slug: 'remove-duplicates-sorted', category: 'arrays-big-o', title: 'Remove Duplicates from Sorted Array', difficulty: 'Medium',
    description_html: `<p>Given a sorted array <code>nums</code>, remove duplicates in place so each unique value appears once, keeping order. Return the number of unique elements <code>k</code>. It's fine if elements after index <code>k</code> are left as-is.</p>
<p>Your method should mutate <code>nums</code> (arrays are passed by reference in C#) and return <code>k</code>. This is exactly the "shifting" cost the note warns about when inserting/removing from the middle of an array.</p>`,
    preamble: '',
    driver: `
var results = new List<TestOutcome>();
foreach (var test in Tests.EnumerateArray())
{
    try
    {
        var nums = JudgeHelpers.Arg<int[]>(test, 0);
        var k = RemoveDuplicates(nums);
        var uniquePart = nums.Take(k).ToArray();
        var output = new object[] { k, uniquePart };
        var expected = JudgeHelpers.Expected<object[]>(test);
        results.Add(new TestOutcome { Pass = JudgeHelpers.DeepEqualJson(output, expected), Output = output, Expected = expected });
    }
    catch (Exception ex)
    {
        results.Add(new TestOutcome { Pass = false, Error = ex.Message });
    }
}
results
`,
    starter_code: `public static int RemoveDuplicates(int[] nums)\n{\n    // mutate nums in place, return the count of unique elements\n}`,
    tests: [
      { args: [[1, 1, 2]], expected: [2, [1, 2]] },
      { args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expected: [5, [0, 1, 2, 3, 4]] },
      { args: [[1, 2, 3]], expected: [3, [1, 2, 3]] },
    ],
  },
  {
    slug: 'max-subarray', category: 'arrays-big-o', title: "Maximum Subarray Sum (Kadane's Algorithm)", difficulty: 'Hard',
    description_html: `<p>Given an integer array <code>nums</code>, find the contiguous subarray (containing at least one number) with the largest sum, and return that sum.</p>
<p>A brute-force solution is O(n<sup>2</sup>); try to find the O(n) approach (Kadane's algorithm) -- a good test of the Big-O rules from the note (one pass, adding, not nesting).</p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'nums', type: 'int[]', index: 0 }], 'MaxSubArray(nums)', 'int'),
    starter_code: `public static int MaxSubArray(int[] nums)\n{\n    // your code here\n}`,
    tests: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { args: [[1]], expected: 1 },
      { args: [[5, 4, -1, 7, 8]], expected: 23 },
      { args: [[-1, -2, -3]], expected: -1 },
    ],
  },

  // ---- searching (Notes topics 2 & 3: Linear Search, Binary Search) ----
  {
    slug: 'linear-search', category: 'searching', title: 'Implement Linear Search', difficulty: 'Easy',
    description_html: `<p>Given an array <code>arr</code> and a <code>target</code> value, return the index of <code>target</code> in <code>arr</code>, or <code>-1</code> if it isn't present. Check elements one at a time, in order -- this is the exact algorithm from the Linear Search note.</p>
<p><b>Example:</b> <code>LinearSearch(new int[] {4,2,9,6}, 9)</code> &rarr; <code>2</code></p>`,
    preamble: '',
    driver: defaultDriver(
      [{ name: 'arr', type: 'int[]', index: 0 }, { name: 'target', type: 'int', index: 1 }],
      'LinearSearch(arr, target)', 'int'
    ),
    starter_code: `public static int LinearSearch(int[] arr, int target)\n{\n    // your code here\n}`,
    tests: [
      { args: [[4, 2, 9, 6], 9], expected: 2 },
      { args: [[4, 2, 9, 6], 7], expected: -1 },
      { args: [[5, 5, 5], 5], expected: 0 },
      { args: [[], 1], expected: -1 },
    ],
  },
  {
    slug: 'binary-search', category: 'searching', title: 'Implement Binary Search', difficulty: 'Easy',
    description_html: `<p>Given a <b>sorted</b> array <code>arr</code> and a <code>target</code> value, return the index of <code>target</code>, or <code>-1</code> if it isn't present. Implement it yourself -- don't call <code>Array.BinarySearch</code>. This is the exact algorithm and trace from the Binary Search note.</p>
<p><b>Example:</b> <code>BinarySearch(new int[] {1,3,5,7,9,11,13}, 9)</code> &rarr; <code>4</code></p>`,
    preamble: '',
    driver: defaultDriver(
      [{ name: 'arr', type: 'int[]', index: 0 }, { name: 'target', type: 'int', index: 1 }],
      'BinarySearch(arr, target)', 'int'
    ),
    starter_code: `public static int BinarySearch(int[] arr, int target)\n{\n    // your code here\n}`,
    tests: [
      { args: [[1, 3, 5, 7, 9, 11, 13], 9], expected: 4 },
      { args: [[1, 3, 5, 7, 9, 11, 13], 1], expected: 0 },
      { args: [[1, 3, 5, 7, 9, 11, 13], 13], expected: 6 },
      { args: [[1, 3, 5, 7, 9, 11, 13], 4], expected: -1 },
    ],
  },
  {
    slug: 'search-insert-position', category: 'searching', title: 'Search Insert Position', difficulty: 'Medium',
    description_html: `<p>Given a sorted array of distinct integers <code>nums</code> and a <code>target</code>, return the index if <code>target</code> is found. If not, return the index where it would be inserted to keep the array sorted.</p>
<p>Must run in O(log n) -- a small twist on binary search: instead of returning <code>-1</code> when the search space closes, return <code>lo</code>, which ends up exactly where the target belongs.</p>
<p><b>Example:</b> <code>SearchInsert(new int[] {1,3,5,6}, 5)</code> &rarr; <code>2</code>; <code>SearchInsert(new int[] {1,3,5,6}, 2)</code> &rarr; <code>1</code></p>`,
    preamble: '',
    driver: defaultDriver(
      [{ name: 'nums', type: 'int[]', index: 0 }, { name: 'target', type: 'int', index: 1 }],
      'SearchInsert(nums, target)', 'int'
    ),
    starter_code: `public static int SearchInsert(int[] nums, int target)\n{\n    // your code here\n}`,
    tests: [
      { args: [[1, 3, 5, 6], 5], expected: 2 },
      { args: [[1, 3, 5, 6], 2], expected: 1 },
      { args: [[1, 3, 5, 6], 7], expected: 4 },
      { args: [[1, 3, 5, 6], 0], expected: 0 },
    ],
  },
  {
    slug: 'first-last-position', category: 'searching', title: 'First and Last Position of an Element in Sorted Array', difficulty: 'Hard',
    description_html: `<p>Given a sorted array <code>nums</code> that may contain duplicates, and a <code>target</code>, return <code>[firstIndex, lastIndex]</code> of the run of <code>target</code> values, or <code>[-1, -1]</code> if <code>target</code> isn't present.</p>
<p>Must run in O(log n) overall -- one binary search that hunts for the leftmost occurrence, and one that hunts for the rightmost, rather than a linear scan outward from any single match.</p>
<p><b>Example:</b> <code>SearchRange(new int[] {5,7,7,8,8,10}, 8)</code> &rarr; <code>[3,4]</code></p>`,
    preamble: '',
    driver: defaultDriver(
      [{ name: 'nums', type: 'int[]', index: 0 }, { name: 'target', type: 'int', index: 1 }],
      'SearchRange(nums, target)', 'int[]'
    ),
    starter_code: `public static int[] SearchRange(int[] nums, int target)\n{\n    // your code here -- return new int[] { first, last }\n}`,
    tests: [
      { args: [[5, 7, 7, 8, 8, 10], 8], expected: [3, 4] },
      { args: [[5, 7, 7, 8, 8, 10], 6], expected: [-1, -1] },
      { args: [[], 0], expected: [-1, -1] },
      { args: [[2, 2, 2, 2], 2], expected: [0, 3] },
    ],
  },

  // ---- sorting (Notes topics 4 & 5: Selection Sort, Insertion Sort) ----
  {
    slug: 'selection-sort', category: 'sorting', title: 'Implement Selection Sort', difficulty: 'Easy',
    description_html: `<p>Implement selection sort, exactly as shown in the note: repeatedly find the minimum of the unsorted remainder and swap it into place. Given an array <code>nums</code>, return a new array with the elements sorted in ascending order.</p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'nums', type: 'int[]', index: 0 }], 'SelectionSort(nums)', 'int[]'),
    starter_code: `public static int[] SelectionSort(int[] nums)\n{\n    int[] arr = (int[])nums.Clone();\n    // your selection sort implementation here\n    return arr;\n}`,
    tests: [
      { args: [[64, 25, 12, 22, 11]], expected: [11, 12, 22, 25, 64] },
      { args: [[1, 2, 3]], expected: [1, 2, 3] },
      { args: [[]], expected: [] },
      { args: [[5, 3, 8, 4]], expected: [3, 4, 5, 8] },
    ],
  },
  {
    slug: 'insertion-sort', category: 'sorting', title: 'Implement Insertion Sort', difficulty: 'Easy',
    description_html: `<p>Implement insertion sort, exactly as shown in the note: grow a sorted prefix at the front, sliding each new element left past everything bigger. Given an array <code>nums</code>, return a new array with the elements sorted in ascending order.</p>
<p>Try it on a reverse-sorted array too -- that's insertion sort's worst case, where every element slides all the way to the front.</p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'nums', type: 'int[]', index: 0 }], 'InsertionSort(nums)', 'int[]'),
    starter_code: `public static int[] InsertionSort(int[] nums)\n{\n    int[] arr = (int[])nums.Clone();\n    // your insertion sort implementation here\n    return arr;\n}`,
    tests: [
      { args: [[5, 3, 8, 4]], expected: [3, 4, 5, 8] },
      { args: [[9, 7, 5, 3, 1]], expected: [1, 3, 5, 7, 9] },
      { args: [[1]], expected: [1] },
      { args: [[]], expected: [] },
    ],
  },
  {
    slug: 'insert-into-sorted-array', category: 'sorting', title: 'Insert into a Sorted Array', difficulty: 'Medium',
    description_html: `<p>Given a sorted array <code>arr</code> and a new <code>value</code>, return a new sorted array with <code>value</code> inserted in the correct position. This is exactly one iteration of insertion sort's inner loop, isolated: sliding elements right to make room for the new value, then dropping it into the gap.</p>
<p><b>Example:</b> <code>InsertSorted(new int[] {1,3,5,7}, 4)</code> &rarr; <code>[1,3,4,5,7]</code></p>`,
    preamble: '',
    driver: defaultDriver(
      [{ name: 'arr', type: 'int[]', index: 0 }, { name: 'value', type: 'int', index: 1 }],
      'InsertSorted(arr, value)', 'int[]'
    ),
    starter_code: `public static int[] InsertSorted(int[] arr, int value)\n{\n    // your code here\n}`,
    tests: [
      { args: [[1, 3, 5, 7], 4], expected: [1, 3, 4, 5, 7] },
      { args: [[], 1], expected: [1] },
      { args: [[2, 4, 6], 1], expected: [1, 2, 4, 6] },
      { args: [[2, 4, 6], 10], expected: [2, 4, 6, 10] },
    ],
  },
  {
    slug: 'minimum-swaps-to-sort', category: 'sorting', title: 'Minimum Swaps to Sort', difficulty: 'Hard',
    description_html: `<p>Given an array <code>nums</code> of distinct integers, return the minimum number of swaps needed to sort it in ascending order.</p>
<p>This is exactly what the Selection Sort note means by "the number of swaps is only O(n) total": selection sort, if it skips swapping an element that's already in its correct spot, performs the true minimum number of swaps possible -- no algorithm can sort the array in fewer. Simulating that (only swap when the minimum isn't already in place) solves this directly.</p>
<p><b>Example:</b> <code>MinSwapsToSort(new int[] {4,3,2,1})</code> &rarr; <code>2</code></p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'nums', type: 'int[]', index: 0 }], 'MinSwapsToSort(nums)', 'int'),
    starter_code: `public static int MinSwapsToSort(int[] nums)\n{\n    // your code here\n}`,
    tests: [
      { args: [[4, 3, 2, 1]], expected: 2 },
      { args: [[1, 5, 4, 3, 2]], expected: 2 },
      { args: [[1, 2, 3]], expected: 0 },
      { args: [[2, 1]], expected: 1 },
    ],
  },

  // ---- multi-dimensional-arrays (Notes topics 6 & 7: Jagged, Multi-Dim) ----
  {
    slug: 'matrix-sum', category: 'multi-dimensional-arrays', title: 'Sum of a 2D Matrix', difficulty: 'Easy',
    description_html: `<p>Given a 2D array <code>matrix</code> (represented as a jagged array, <code>int[][]</code>), return the sum of all its elements.</p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'matrix', type: 'int[][]', index: 0 }], 'SumMatrix(matrix)', 'int'),
    starter_code: `public static int SumMatrix(int[][] matrix)\n{\n    // your code here\n}`,
    tests: [
      { args: [[[1, 2], [3, 4]]], expected: 10 },
      { args: [[[5]]], expected: 5 },
      { args: [[[1, 1, 1], [1, 1, 1]]], expected: 6 },
    ],
  },
  {
    slug: 'flatten-jagged-array', category: 'multi-dimensional-arrays', title: 'Flatten a Jagged Array', difficulty: 'Easy',
    description_html: `<p>Given a jagged array <code>int[][]</code> (rows of different lengths), return a single flat <code>List&lt;int&gt;</code> preserving the original order -- this is the exact <code>FlattenJagged</code> example from the Jagged Arrays note.</p>
<p><b>Example:</b> <code>{{1,2,3},{4},{5,6}}</code> &rarr; <code>[1,2,3,4,5,6]</code></p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'jagged', type: 'int[][]', index: 0 }], 'FlattenJagged(jagged)', 'List<int>'),
    starter_code: `public static List<int> FlattenJagged(int[][] jagged)\n{\n    // your code here\n}`,
    tests: [
      { args: [[[1, 2, 3], [4], [5, 6]]], expected: [1, 2, 3, 4, 5, 6] },
      { args: [[[], [1], []]], expected: [1] },
    ],
  },
  {
    slug: 'transpose-matrix', category: 'multi-dimensional-arrays', title: 'Transpose a Matrix', difficulty: 'Medium',
    description_html: `<p>Given a 2D array <code>matrix</code> (<code>int[][]</code>), return its transpose (rows become columns) -- the exact <code>Transpose</code> example from the Multi-Dimensional Arrays note.</p>
<p><b>Example:</b> <code>{{1,2,3},{4,5,6}}</code> &rarr; <code>{{1,4},{2,5},{3,6}}</code></p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'matrix', type: 'int[][]', index: 0 }], 'Transpose(matrix)', 'int[][]'),
    starter_code: `public static int[][] Transpose(int[][] matrix)\n{\n    // your code here\n}`,
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6]]], expected: [[1, 4], [2, 5], [3, 6]] },
      { args: [[[1]]], expected: [[1]] },
    ],
  },
  {
    slug: 'row-with-max-sum', category: 'multi-dimensional-arrays', title: 'Row with Maximum Sum', difficulty: 'Medium',
    description_html: `<p>Given a 2D array <code>matrix</code> (<code>int[][]</code>), return the index (0-based) of the row whose elements have the largest sum.</p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'matrix', type: 'int[][]', index: 0 }], 'RowWithMaxSum(matrix)', 'int'),
    starter_code: `public static int RowWithMaxSum(int[][] matrix)\n{\n    // your code here\n}`,
    tests: [
      { args: [[[1, 2], [10, 10], [0, 1]]], expected: 1 },
      { args: [[[5], [1], [3]]], expected: 0 },
    ],
  },
  {
    slug: 'spiral-traversal', category: 'multi-dimensional-arrays', title: 'Spiral Matrix Traversal', difficulty: 'Hard',
    description_html: `<p>Given a 2D array <code>matrix</code> (<code>int[][]</code>), return all elements in spiral order (clockwise, starting top-left) as a <code>List&lt;int&gt;</code> -- the exact spiral pattern walked through in the Multi-Dimensional Arrays note.</p>
<p><b>Example:</b> <code>{{1,2,3},{4,5,6},{7,8,9}}</code> &rarr; <code>[1,2,3,6,9,8,7,4,5]</code></p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'matrix', type: 'int[][]', index: 0 }], 'SpiralOrder(matrix)', 'List<int>'),
    starter_code: `public static List<int> SpiralOrder(int[][] matrix)\n{\n    // your code here\n}`,
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      { args: [[[1, 2], [3, 4]]], expected: [1, 2, 4, 3] },
    ],
  },

  // ---- arraylists-adt (Notes topic 8: Lists / Abstract Data Type) ----
  {
    slug: 'remove-by-value', category: 'arraylists-adt', title: 'Remove First Occurrence by Value', difficulty: 'Easy',
    description_html: `<p>Given a list <code>list</code> and a <code>value</code>, return a new array with the first occurrence of <code>value</code> removed (all other elements keep their order).</p>`,
    preamble: '',
    driver: defaultDriver(
      [{ name: 'list', type: 'int[]', index: 0 }, { name: 'value', type: 'int', index: 1 }],
      'RemoveByValue(list, value)', 'int[]'
    ),
    starter_code: `public static int[] RemoveByValue(int[] list, int value)\n{\n    // your code here\n}`,
    tests: [
      { args: [[1, 2, 3, 2, 4], 2], expected: [1, 3, 2, 4] },
      { args: [[1, 2, 3], 5], expected: [1, 2, 3] },
    ],
  },
  {
    slug: 'dynamic-array-list', category: 'arraylists-adt', title: 'Implement a Dynamic ArrayList', difficulty: 'Medium',
    description_html: `<p>Implement a class <code>MyArrayList</code> backed by a dynamic array -- the List ADT from the note: an interface (<code>Add</code>, <code>Get</code>, <code>Size</code>) that doesn't expose how it's stored underneath. A plain <code>List&lt;int&gt;</code> under the hood is fine -- the point is the public API.</p>
<ul><li><code>void Add(int value)</code> - append a value</li>
<li><code>int Get(int index)</code> - return the value at index</li>
<li><code>int Size()</code> - return the number of elements</li></ul>
<p>Operations are applied in sequence and each method's return value (or <code>null</code> for <code>void</code> operations) is checked.</p>`,
    preamble: '',
    driver: designDriver('MyArrayList'),
    starter_code: `public class MyArrayList\n{\n    private List<int> items = new List<int>();\n\n    public void Add(int value)\n    {\n        // your code here\n    }\n\n    public int Get(int index)\n    {\n        // your code here\n    }\n\n    public int Size()\n    {\n        // your code here\n    }\n}`,
    tests: [
      {
        args: [
          ['MyArrayList', 'Add', 'Add', 'Get', 'Size', 'Add', 'Get'],
          [[], [1], [2], [0], [], [3], [2]],
        ],
        expected: [null, null, null, 1, 2, null, 3],
      },
    ],
  },
  {
    slug: 'rotate-array-left', category: 'arraylists-adt', title: 'Rotate Array Left by K', difficulty: 'Medium',
    description_html: `<p>Given an array <code>nums</code> and an integer <code>k</code>, return the array rotated left by <code>k</code> positions.</p>
<p><b>Example:</b> <code>RotateLeft(new int[] {1,2,3,4,5}, 2)</code> &rarr; <code>[3,4,5,1,2]</code></p>`,
    preamble: '',
    driver: defaultDriver(
      [{ name: 'nums', type: 'int[]', index: 0 }, { name: 'k', type: 'int', index: 1 }],
      'RotateLeft(nums, k)', 'int[]'
    ),
    starter_code: `public static int[] RotateLeft(int[] nums, int k)\n{\n    // your code here\n}`,
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [3, 4, 5, 1, 2] },
      { args: [[1, 2, 3], 0], expected: [1, 2, 3] },
      { args: [[1, 2, 3], 3], expected: [1, 2, 3] },
    ],
  },
  {
    slug: 'array-list-insert-at', category: 'arraylists-adt', title: 'Insert at Index', difficulty: 'Medium',
    description_html: `<p>Given a list <code>list</code>, an <code>index</code>, and a <code>value</code>, return a new array with <code>value</code> inserted at <code>index</code> (shifting later elements right), mirroring <code>List&lt;T&gt;.Insert</code>.</p>`,
    preamble: '',
    driver: defaultDriver(
      [{ name: 'list', type: 'int[]', index: 0 }, { name: 'index', type: 'int', index: 1 }, { name: 'value', type: 'int', index: 2 }],
      'InsertAt(list, index, value)', 'int[]'
    ),
    starter_code: `public static int[] InsertAt(int[] list, int index, int value)\n{\n    // your code here\n}`,
    tests: [
      { args: [[1, 2, 4], 2, 3], expected: [1, 2, 3, 4] },
      { args: [[], 0, 1], expected: [1] },
    ],
  },
  {
    slug: 'dynamic-array-resize-count', category: 'arraylists-adt', title: 'Count Resizes in a Growable Array', difficulty: 'Hard',
    description_html: `<p>Implement a class <code>MyGrowList</code> that mimics how <code>List&lt;T&gt;</code> grows internally (see the note): it starts backed by an array of capacity <b>4</b>, and whenever <code>Add</code> is called with no room left, it allocates a new array of <b>double</b> the capacity, copies everything over, and only <i>then</i> stores the new value.</p>
<ul><li><code>void Add(int value)</code> - append a value, resizing first if the backing array is full</li>
<li><code>int ResizeCount()</code> - return how many times the backing array has been resized (doubled) so far</li></ul>
<p>This turns the note's "resizing happens only O(log n) times, so Add is O(1) amortized" claim into something you can directly count.</p>`,
    preamble: '',
    driver: designDriver('MyGrowList'),
    starter_code: `public class MyGrowList\n{\n    private int[] items = new int[4];\n    private int count = 0;\n    private int resizeCount = 0;\n\n    public void Add(int value)\n    {\n        // your code here -- resize (doubling) before storing, if full\n    }\n\n    public int ResizeCount()\n    {\n        // your code here\n    }\n}`,
    tests: [
      {
        args: [
          ['MyGrowList', 'Add', 'Add', 'Add', 'Add', 'ResizeCount', 'Add', 'ResizeCount', 'Add', 'Add', 'Add', 'ResizeCount', 'Add', 'ResizeCount'],
          [[], [1], [2], [3], [4], [], [5], [], [6], [7], [8], [], [9], []],
        ],
        expected: [null, null, null, null, null, 0, null, 1, null, null, null, 1, null, 2],
      },
    ],
  },

  // ---- stacks-queues (Notes topics 9 & 10: Stacks, Queues) ----
  {
    slug: 'valid-parentheses', category: 'stacks-queues', title: 'Valid Parentheses', difficulty: 'Easy',
    description_html: `<p>Given a string <code>s</code> containing just <code>()[]{}</code> characters, determine if the input is valid (every opening bracket is closed by the same type, in the correct order). This is the exact bracket-matching pattern from the Stacks note.</p>`,
    preamble: '',
    driver: defaultDriver([{ name: 's', type: 'string', index: 0 }], 'IsValid(s)', 'bool'),
    starter_code: `public static bool IsValid(string s)\n{\n    // your code here, use a Stack<char>\n}`,
    tests: [
      { args: ['()[]{}'], expected: true },
      { args: ['(]'], expected: false },
      { args: ['{[]}'], expected: true },
      { args: ['('], expected: false },
    ],
  },
  {
    slug: 'min-stack', category: 'stacks-queues', title: 'Min Stack', difficulty: 'Medium',
    description_html: `<p>Implement a class <code>MinStack</code> supporting, all in O(1) time:</p>
<ul><li><code>void Push(int x)</code> - push a value onto the stack (no return value needed)</li>
<li><code>void Pop()</code> - remove the top element (no return value needed)</li>
<li><code>int Top()</code> - return the top element</li>
<li><code>int GetMin()</code> - return the current minimum element</li></ul>`,
    preamble: '',
    driver: designDriver('MinStack'),
    starter_code: `public class MinStack\n{\n    private Stack<int> stack = new Stack<int>();\n    private Stack<int> minStack = new Stack<int>();\n\n    public void Push(int x)\n    {\n        // your code here\n    }\n\n    public void Pop()\n    {\n        // your code here\n    }\n\n    public int Top()\n    {\n        // your code here\n    }\n\n    public int GetMin()\n    {\n        // your code here\n    }\n}`,
    tests: [
      {
        args: [
          ['MinStack', 'Push', 'Push', 'Push', 'GetMin', 'Pop', 'Top', 'GetMin'],
          [[], [-2], [0], [-3], [], [], [], []],
        ],
        expected: [null, null, null, null, -3, null, 0, -2],
      },
    ],
  },
  {
    slug: 'queue-using-two-stacks', category: 'stacks-queues', title: 'Implement Queue using Two Stacks', difficulty: 'Medium',
    description_html: `<p>Implement a class <code>MyQueue</code> that implements a FIFO queue using only two <code>Stack&lt;int&gt;</code> fields -- the exact "queue from two stacks" trick from the Queues note, supporting:</p>
<ul><li><code>void Push(int x)</code> - add an element to the back (no return value needed)</li>
<li><code>int Pop()</code> - remove and return the element at the front</li>
<li><code>int Peek()</code> - return the element at the front without removing it</li>
<li><code>bool Empty()</code> - return whether the queue is empty</li></ul>`,
    preamble: '',
    driver: designDriver('MyQueue'),
    starter_code: `public class MyQueue\n{\n    private Stack<int> inStack = new Stack<int>();\n    private Stack<int> outStack = new Stack<int>();\n\n    public void Push(int x)\n    {\n        // your code here\n    }\n\n    public int Pop()\n    {\n        // your code here\n    }\n\n    public int Peek()\n    {\n        // your code here\n    }\n\n    public bool Empty()\n    {\n        // your code here\n    }\n}`,
    tests: [
      {
        args: [
          ['MyQueue', 'Push', 'Push', 'Peek', 'Pop', 'Empty'],
          [[], [1], [2], [], [], []],
        ],
        expected: [null, null, null, 1, 1, false],
      },
    ],
  },
  {
    slug: 'circular-queue', category: 'stacks-queues', title: 'Design Circular Queue', difficulty: 'Hard',
    description_html: `<p>Implement a class <code>MyCircularQueue</code> with a fixed capacity <code>k</code> (passed to the constructor) -- the circular buffer approach the Queues note describes as how a real O(1) array-backed queue avoids ever shifting elements. Support:</p>
<ul><li><code>bool EnQueue(int value)</code> - returns <code>true</code> if successful</li>
<li><code>bool DeQueue()</code> - returns <code>true</code> if successful</li>
<li><code>int Rear()</code> - returns the last element, or <code>-1</code> if empty</li>
<li><code>bool IsFull()</code></li></ul>`,
    preamble: '',
    driver: designDriver('MyCircularQueue'),
    starter_code: `public class MyCircularQueue\n{\n    private int capacity;\n    private List<int> items = new List<int>();\n\n    public MyCircularQueue(int k)\n    {\n        capacity = k;\n    }\n\n    public bool EnQueue(int value)\n    {\n        // your code here\n    }\n\n    public bool DeQueue()\n    {\n        // your code here\n    }\n\n    public int Rear()\n    {\n        // your code here\n    }\n\n    public bool IsFull()\n    {\n        // your code here\n    }\n}`,
    tests: [
      {
        args: [
          ['MyCircularQueue', 'EnQueue', 'EnQueue', 'EnQueue', 'EnQueue', 'Rear', 'IsFull', 'DeQueue', 'EnQueue', 'Rear'],
          [[3], [1], [2], [3], [4], [], [], [], [4], []],
        ],
        expected: [null, true, true, true, false, 3, true, true, true, 4],
      },
    ],
  },

  // ---- dictionaries (Notes topic 11: Dictionaries / Hash Maps) ----
  {
    slug: 'two-sum', category: 'dictionaries', title: 'Two Sum', difficulty: 'Easy',
    description_html: `<p>Given an array <code>nums</code> and an integer <code>target</code>, return the indices of the two numbers that add up to <code>target</code>. Assume exactly one solution exists and you may not use the same element twice. Order of the two indices in your returned array does not matter.</p>
<p>This is the "trade space for time" example from the Dictionaries note itself: remember every number you've seen in a dictionary as you go, turning an O(n<sup>2</sup>) pair check into O(n).</p>
<p><b>Example:</b> <code>TwoSum(new int[] {2,7,11,15}, 9)</code> &rarr; <code>[0,1]</code></p>`,
    preamble: '',
    driver: `
var results = new List<TestOutcome>();
foreach (var test in Tests.EnumerateArray())
{
    try
    {
        var nums = JudgeHelpers.Arg<int[]>(test, 0);
        var target = JudgeHelpers.Arg<int>(test, 1);
        var output = TwoSum(nums, target);
        var sortedOutput = (int[])output.Clone();
        Array.Sort(sortedOutput);
        var expected = JudgeHelpers.Expected<int[]>(test);
        var sortedExpected = (int[])expected.Clone();
        Array.Sort(sortedExpected);
        results.Add(new TestOutcome { Pass = JudgeHelpers.DeepEqualJson(sortedOutput, sortedExpected), Output = sortedOutput, Expected = sortedExpected });
    }
    catch (Exception ex)
    {
        results.Add(new TestOutcome { Pass = false, Error = ex.Message });
    }
}
results
`,
    starter_code: `public static int[] TwoSum(int[] nums, int target)\n{\n    // return the two indices as an array, e.g. new int[] { i, j }\n}`,
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[3, 3], 6], expected: [0, 1] },
    ],
  },
  {
    slug: 'contains-duplicate', category: 'dictionaries', title: 'Contains Duplicate', difficulty: 'Easy',
    description_html: `<p>Given an array <code>nums</code>, return <code>true</code> if any value appears at least twice, and <code>false</code> if every element is distinct.</p>
<p>A <code>HashSet&lt;int&gt;</code> -- the note's suggested cousin of <code>Dictionary</code> for "have I seen this before?" checks -- solves this in one O(n) pass.</p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'nums', type: 'int[]', index: 0 }], 'ContainsDuplicate(nums)', 'bool'),
    starter_code: `public static bool ContainsDuplicate(int[] nums)\n{\n    // your code here\n}`,
    tests: [
      { args: [[1, 2, 3, 1]], expected: true },
      { args: [[1, 2, 3, 4]], expected: false },
      { args: [[]], expected: false },
      { args: [[1, 1, 1, 1]], expected: true },
    ],
  },
  {
    slug: 'first-unique-char', category: 'dictionaries', title: 'First Unique Character in a String', difficulty: 'Medium',
    description_html: `<p>Given a string <code>s</code>, return the index of the first character that appears exactly once. Return <code>-1</code> if every character repeats.</p>
<p>Count every character's frequency in a dictionary in one pass, then scan once more looking for the first count of 1.</p>
<p><b>Example:</b> <code>FirstUniqChar("leetcode")</code> &rarr; <code>0</code>; <code>FirstUniqChar("loveleetcode")</code> &rarr; <code>2</code></p>`,
    preamble: '',
    driver: defaultDriver([{ name: 's', type: 'string', index: 0 }], 'FirstUniqChar(s)', 'int'),
    starter_code: `public static int FirstUniqChar(string s)\n{\n    // your code here\n}`,
    tests: [
      { args: ['leetcode'], expected: 0 },
      { args: ['loveleetcode'], expected: 2 },
      { args: ['aabb'], expected: -1 },
      { args: [''], expected: -1 },
    ],
  },
  {
    slug: 'longest-consecutive-sequence', category: 'dictionaries', title: 'Longest Consecutive Sequence', difficulty: 'Hard',
    description_html: `<p>Given an unsorted array of integers <code>nums</code>, return the length of the longest run of consecutive integers (e.g. <code>[1,2,3,4]</code> has length 4), in O(n) time.</p>
<p>Sorting first would work but costs O(n log n). Instead, put every value in a <code>HashSet&lt;int&gt;</code>, and only start counting a run from a value <code>v</code> where <code>v - 1</code> is <i>not</i> in the set (i.e. <code>v</code> is the start of a run) -- that guarantees each run is only ever walked once, in total O(n) across the whole array.</p>
<p><b>Example:</b> <code>LongestConsecutive(new int[] {100,4,200,1,3,2})</code> &rarr; <code>4</code></p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'nums', type: 'int[]', index: 0 }], 'LongestConsecutive(nums)', 'int'),
    starter_code: `public static int LongestConsecutive(int[] nums)\n{\n    // your code here\n}`,
    tests: [
      { args: [[100, 4, 200, 1, 3, 2]], expected: 4 },
      { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9 },
      { args: [[]], expected: 0 },
      { args: [[5]], expected: 1 },
    ],
  },

  // ---- linked-lists (Notes topic 12: Linked Lists) ----
  {
    slug: 'linked-list-length', category: 'linked-lists', title: 'Length of a Linked List', difficulty: 'Easy',
    description_html: `<p>Given the head of a singly linked list (built from <code>ListNode</code>), return the number of nodes it contains.</p>
<p>A <code>ListNode</code> class is provided for you: <code>{ int Val, ListNode Next }</code>.</p>`,
    preamble: linkedListPreamble,
    driver: `
var results = new List<TestOutcome>();
foreach (var test in Tests.EnumerateArray())
{
    try
    {
        var values = JudgeHelpers.Arg<int[]>(test, 0);
        var head = ArrayToList(values);
        var output = GetLength(head);
        var expected = JudgeHelpers.Expected<int>(test);
        results.Add(new TestOutcome { Pass = JudgeHelpers.DeepEqualJson(output, expected), Output = output, Expected = expected });
    }
    catch (Exception ex)
    {
        results.Add(new TestOutcome { Pass = false, Error = ex.Message });
    }
}
results
`,
    starter_code: `public static int GetLength(ListNode head)\n{\n    // your code here\n}`,
    tests: [
      { args: [[1, 2, 3, 4]], expected: 4 },
      { args: [[]], expected: 0 },
      { args: [[1]], expected: 1 },
    ],
  },
  {
    slug: 'reverse-linked-list', category: 'linked-lists', title: 'Reverse a Linked List', difficulty: 'Medium',
    description_html: `<p>Given the head of a singly linked list, reverse it and return the new head -- the exact reversal walk-through from the note (re-pointing each node's <code>Next</code> back to the previous node).</p>`,
    preamble: linkedListPreamble,
    driver: `
var results = new List<TestOutcome>();
foreach (var test in Tests.EnumerateArray())
{
    try
    {
        var values = JudgeHelpers.Arg<int[]>(test, 0);
        var head = ArrayToList(values);
        var resultHead = ReverseList(head);
        var output = ListToArray(resultHead);
        var expected = JudgeHelpers.Expected<List<int>>(test);
        results.Add(new TestOutcome { Pass = JudgeHelpers.DeepEqualJson(output, expected), Output = output, Expected = expected });
    }
    catch (Exception ex)
    {
        results.Add(new TestOutcome { Pass = false, Error = ex.Message });
    }
}
results
`,
    starter_code: `public static ListNode ReverseList(ListNode head)\n{\n    // your code here\n}`,
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { args: [[]], expected: [] },
      { args: [[1]], expected: [1] },
    ],
  },
  {
    slug: 'linked-list-middle', category: 'linked-lists', title: 'Find the Middle Node', difficulty: 'Easy',
    description_html: `<p>Given the head of a singly linked list, return the value of the middle node. If there are two middle nodes, return the value of the second one.</p>
<p>Use the fast/slow pointer pattern from the note: advance one pointer twice as fast as the other, and when the fast one reaches the end, the slow one is at the middle.</p>`,
    preamble: linkedListPreamble,
    driver: `
var results = new List<TestOutcome>();
foreach (var test in Tests.EnumerateArray())
{
    try
    {
        var values = JudgeHelpers.Arg<int[]>(test, 0);
        var head = ArrayToList(values);
        var mid = FindMiddle(head);
        object output = mid != null ? (object)mid.Val : null;
        var expected = JudgeHelpers.Expected<int?>(test);
        results.Add(new TestOutcome { Pass = JudgeHelpers.DeepEqualJson(output, expected), Output = output, Expected = expected });
    }
    catch (Exception ex)
    {
        results.Add(new TestOutcome { Pass = false, Error = ex.Message });
    }
}
results
`,
    starter_code: `public static ListNode FindMiddle(ListNode head)\n{\n    // your code here, return the middle ListNode\n}`,
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: 3 },
      { args: [[1, 2, 3, 4, 5, 6]], expected: 4 },
      { args: [[1]], expected: 1 },
    ],
  },
  {
    slug: 'linked-list-cycle', category: 'linked-lists', title: 'Linked List Cycle Detection', difficulty: 'Hard',
    description_html: `<p>Given a linked list, determine if it contains a cycle. The input is given as <code>{ values, pos }</code> where <code>pos</code> is the index the tail connects back to (<code>-1</code> means no cycle). Return <code>true</code> or <code>false</code>.</p>
<p>This is the note's other fast/slow pointer (Floyd's algorithm) use case: if there's a cycle, a faster pointer will eventually lap a slower one and they'll meet, for O(1) extra space.</p>`,
    preamble: linkedListPreamble + `
public class CycleInput
{
    public int[] Values { get; set; }
    public int Pos { get; set; }
}
`,
    driver: `
var results = new List<TestOutcome>();
foreach (var test in Tests.EnumerateArray())
{
    try
    {
        var input = JudgeHelpers.Arg<CycleInput>(test, 0);
        var head = ArrayToList(input.Values);
        if (input.Pos >= 0)
        {
            var nodes = new List<ListNode>();
            var cur = head;
            while (cur != null) { nodes.Add(cur); cur = cur.Next; }
            if (nodes.Count > 0) nodes[nodes.Count - 1].Next = nodes[input.Pos];
        }
        var output = HasCycle(head);
        var expected = JudgeHelpers.Expected<bool>(test);
        results.Add(new TestOutcome { Pass = JudgeHelpers.DeepEqualJson(output, expected), Output = output, Expected = expected });
    }
    catch (Exception ex)
    {
        results.Add(new TestOutcome { Pass = false, Error = ex.Message });
    }
}
results
`,
    starter_code: `public static bool HasCycle(ListNode head)\n{\n    // your code here\n}`,
    tests: [
      { args: [{ values: [3, 2, 0, -4], pos: 1 }], expected: true },
      { args: [{ values: [1, 2], pos: -1 }], expected: false },
      { args: [{ values: [1], pos: -1 }], expected: false },
    ],
  },
  {
    slug: 'remove-nth-from-end', category: 'linked-lists', title: 'Remove Nth Node From End', difficulty: 'Medium',
    description_html: `<p>Given the head of a linked list and an integer <code>n</code>, remove the <code>n</code>-th node from the end of the list and return the new head.</p>`,
    preamble: linkedListPreamble,
    driver: `
var results = new List<TestOutcome>();
foreach (var test in Tests.EnumerateArray())
{
    try
    {
        var values = JudgeHelpers.Arg<int[]>(test, 0);
        var n = JudgeHelpers.Arg<int>(test, 1);
        var head = ArrayToList(values);
        var resultHead = RemoveNthFromEnd(head, n);
        var output = ListToArray(resultHead);
        var expected = JudgeHelpers.Expected<List<int>>(test);
        results.Add(new TestOutcome { Pass = JudgeHelpers.DeepEqualJson(output, expected), Output = output, Expected = expected });
    }
    catch (Exception ex)
    {
        results.Add(new TestOutcome { Pass = false, Error = ex.Message });
    }
}
results
`,
    starter_code: `public static ListNode RemoveNthFromEnd(ListNode head, int n)\n{\n    // your code here\n}`,
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] },
      { args: [[1], 1], expected: [] },
      { args: [[1, 2], 1], expected: [1] },
    ],
  },
];

module.exports = { categories, problems };
