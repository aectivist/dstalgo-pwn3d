// Categories and problems seeded into the site. Solutions are written and
// judged in C#, executed server-side by judge-host (see judge-host/ and
// server/csharpJudge.js) -- NOT in the browser, since arbitrary C# can't be
// sandboxed client-side the way JavaScript could in a Web Worker.
//
// To add more problems for a category later, just append entries here and
// re-run `npm run seed` -- seeding upserts by slug, so existing user
// progress is never disturbed.

const categories = [
  { slug: 'arrays-big-o', name: 'Arrays & Big-O', order_index: 1,
    description: 'Working with 1D arrays and reasoning about time/space complexity.' },
  { slug: 'sorting', name: 'Sorting Algorithms', order_index: 2,
    description: 'Classic comparison-based sorting algorithms implemented by hand.' },
  { slug: 'multi-dimensional-arrays', name: 'Multi-Dimensional & Jagged Arrays', order_index: 3,
    description: '2D matrices and jagged (ragged) arrays.' },
  { slug: 'arraylists-adt', name: 'ArrayLists & Abstract Data Types', order_index: 4,
    description: 'Dynamic array-backed lists and abstract data type operations.' },
  { slug: 'linked-lists', name: 'Linked Lists', order_index: 5,
    description: 'Singly linked list construction and manipulation.' },
  { slug: 'stacks-queues', name: 'Stacks & Queues', order_index: 6,
    description: 'LIFO/FIFO abstract data types, implemented from scratch.' },
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
  // ---- arrays-big-o ----
  {
    slug: 'find-maximum', category: 'arrays-big-o', title: 'Find the Maximum Value', difficulty: 'Easy',
    description_html: `<p>Given an array of integers <code>nums</code>, return the maximum value in the array.</p>
<p>Aim for a single pass, O(n) time.</p>
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
    slug: 'two-sum', category: 'arrays-big-o', title: 'Two Sum', difficulty: 'Easy',
    description_html: `<p>Given an array <code>nums</code> and an integer <code>target</code>, return the indices of the two numbers that add up to <code>target</code>. Assume exactly one solution exists and you may not use the same element twice. Order of the two indices in your returned array does not matter.</p>
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
    slug: 'remove-duplicates-sorted', category: 'arrays-big-o', title: 'Remove Duplicates from Sorted Array', difficulty: 'Medium',
    description_html: `<p>Given a sorted array <code>nums</code>, remove duplicates in place so each unique value appears once, keeping order. Return the number of unique elements <code>k</code>. It's fine if elements after index <code>k</code> are left as-is.</p>
<p>Your method should mutate <code>nums</code> (arrays are passed by reference in C#) and return <code>k</code>.</p>`,
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
<p>A brute-force solution is O(n<sup>2</sup>); try to find the O(n) approach (Kadane's algorithm).</p>`,
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

  // ---- sorting ----
  {
    slug: 'bubble-sort', category: 'sorting', title: 'Implement Bubble Sort', difficulty: 'Easy',
    description_html: `<p>Implement bubble sort. Given an array <code>nums</code>, return a new array with the elements sorted in ascending order.</p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'nums', type: 'int[]', index: 0 }], 'BubbleSort(nums)', 'int[]'),
    starter_code: `public static int[] BubbleSort(int[] nums)\n{\n    int[] arr = (int[])nums.Clone();\n    // your bubble sort implementation here\n    return arr;\n}`,
    tests: [
      { args: [[5, 3, 8, 4, 2]], expected: [2, 3, 4, 5, 8] },
      { args: [[1]], expected: [1] },
      { args: [[]], expected: [] },
      { args: [[9, 1, 8, 2, 7, 3]], expected: [1, 2, 3, 7, 8, 9] },
    ],
  },
  {
    slug: 'selection-sort', category: 'sorting', title: 'Implement Selection Sort', difficulty: 'Easy',
    description_html: `<p>Implement selection sort. Given an array <code>nums</code>, return a new array with the elements sorted in ascending order.</p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'nums', type: 'int[]', index: 0 }], 'SelectionSort(nums)', 'int[]'),
    starter_code: `public static int[] SelectionSort(int[] nums)\n{\n    int[] arr = (int[])nums.Clone();\n    // your selection sort implementation here\n    return arr;\n}`,
    tests: [
      { args: [[64, 25, 12, 22, 11]], expected: [11, 12, 22, 25, 64] },
      { args: [[1, 2, 3]], expected: [1, 2, 3] },
      { args: [[]], expected: [] },
    ],
  },
  {
    slug: 'merge-sort', category: 'sorting', title: 'Implement Merge Sort', difficulty: 'Medium',
    description_html: `<p>Implement merge sort (divide and conquer, O(n log n)). Given an array <code>nums</code>, return a new sorted array.</p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'nums', type: 'int[]', index: 0 }], 'MergeSort(nums)', 'int[]'),
    starter_code: `public static int[] MergeSort(int[] nums)\n{\n    // your merge sort implementation here\n    return (int[])nums.Clone();\n}`,
    tests: [
      { args: [[38, 27, 43, 3, 9, 82, 10]], expected: [3, 9, 10, 27, 38, 43, 82] },
      { args: [[5, 1]], expected: [1, 5] },
      { args: [[]], expected: [] },
    ],
  },
  {
    slug: 'quick-sort', category: 'sorting', title: 'Implement Quick Sort', difficulty: 'Hard',
    description_html: `<p>Implement quick sort (partition-based, average O(n log n)). Given an array <code>nums</code>, return a new sorted array.</p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'nums', type: 'int[]', index: 0 }], 'QuickSort(nums)', 'int[]'),
    starter_code: `public static int[] QuickSort(int[] nums)\n{\n    // your quick sort implementation here\n    return (int[])nums.Clone();\n}`,
    tests: [
      { args: [[10, 7, 8, 9, 1, 5]], expected: [1, 5, 7, 8, 9, 10] },
      { args: [[1]], expected: [1] },
      { args: [[]], expected: [] },
      { args: [[3, 3, 1, 2]], expected: [1, 2, 3, 3] },
    ],
  },

  // ---- multi-dimensional-arrays ----
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
    slug: 'transpose-matrix', category: 'multi-dimensional-arrays', title: 'Transpose a Matrix', difficulty: 'Medium',
    description_html: `<p>Given a 2D array <code>matrix</code> (<code>int[][]</code>), return its transpose (rows become columns).</p>
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
    slug: 'flatten-jagged-array', category: 'multi-dimensional-arrays', title: 'Flatten a Jagged Array', difficulty: 'Easy',
    description_html: `<p>Given a jagged array <code>int[][]</code> (rows of different lengths), return a single flat <code>List&lt;int&gt;</code> preserving the original order.</p>
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
    slug: 'spiral-traversal', category: 'multi-dimensional-arrays', title: 'Spiral Matrix Traversal', difficulty: 'Hard',
    description_html: `<p>Given a 2D array <code>matrix</code> (<code>int[][]</code>), return all elements in spiral order (clockwise, starting top-left) as a <code>List&lt;int&gt;</code>.</p>
<p><b>Example:</b> <code>{{1,2,3},{4,5,6},{7,8,9}}</code> &rarr; <code>[1,2,3,6,9,8,7,4,5]</code></p>`,
    preamble: '',
    driver: defaultDriver([{ name: 'matrix', type: 'int[][]', index: 0 }], 'SpiralOrder(matrix)', 'List<int>'),
    starter_code: `public static List<int> SpiralOrder(int[][] matrix)\n{\n    // your code here\n}`,
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expected: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      { args: [[[1, 2], [3, 4]]], expected: [1, 2, 4, 3] },
    ],
  },

  // ---- arraylists-adt ----
  {
    slug: 'dynamic-array-list', category: 'arraylists-adt', title: 'Implement a Dynamic ArrayList', difficulty: 'Medium',
    description_html: `<p>Implement a class <code>MyArrayList</code> backed by a dynamic array (a plain <code>List&lt;int&gt;</code> under the hood is fine -- the point is the public API), with methods:</p>
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

  // ---- linked-lists ----
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
    description_html: `<p>Given the head of a singly linked list, reverse it and return the new head.</p>`,
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
    slug: 'linked-list-cycle', category: 'linked-lists', title: 'Linked List Cycle Detection', difficulty: 'Hard',
    description_html: `<p>Given a linked list, determine if it contains a cycle. The input is given as <code>{ values, pos }</code> where <code>pos</code> is the index the tail connects back to (<code>-1</code> means no cycle). Return <code>true</code> or <code>false</code>.</p>
<p>Try Floyd's cycle detection (slow/fast pointers) for O(1) extra space.</p>`,
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
    slug: 'linked-list-middle', category: 'linked-lists', title: 'Find the Middle Node', difficulty: 'Easy',
    description_html: `<p>Given the head of a singly linked list, return the value of the middle node. If there are two middle nodes, return the value of the second one.</p>`,
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

  // ---- stacks-queues ----
  {
    slug: 'valid-parentheses', category: 'stacks-queues', title: 'Valid Parentheses', difficulty: 'Easy',
    description_html: `<p>Given a string <code>s</code> containing just <code>()[]{}</code> characters, determine if the input is valid (every opening bracket is closed by the same type, in the correct order).</p>`,
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
    description_html: `<p>Implement a class <code>MyQueue</code> that implements a FIFO queue using only two <code>Stack&lt;int&gt;</code> fields, supporting:</p>
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
    description_html: `<p>Implement a class <code>MyCircularQueue</code> with a fixed capacity <code>k</code> (passed to the constructor), supporting:</p>
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
];

module.exports = { categories, problems };
