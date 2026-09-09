// Categories and problems seeded into the site. Solutions are written and
// judged in C#, compiled and run server-side by judge-host (see judge-host/
// and server/csharpJudge.js) -- NOT in the browser, since arbitrary C#
// can't be sandboxed client-side the way JavaScript could in a Web Worker.
//
// Judging model: each problem is a COMPLETE, standalone C# console program
// (starter_code provides a working Main plus a method stub to fill in --
// nothing is hidden, nothing is appended behind the scenes). judge-host
// runs a real `dotnet build` on exactly what the student submitted, then
// runs the compiled program once per test case with that test's `input`
// piped to stdin, and compares its stdout (trimmed) against the test's
// `expectedOutput`, exactly like a classic competitive-programming judge
// (Codeforces/HackerRank style). There is no "call this function and
// inspect the return value" driver magic anymore.
//
// I/O conventions used throughout, so problems stay consistent:
//   - int[]     : one line, space-separated (empty line = empty array)
//   - int       : one line, the integer
//   - string    : one line, the raw string (may be empty)
//   - bool out  : Console.WriteLine(boolValue) -> "True"/"False" (C#'s
//                 own default ToString(), so no special-casing needed)
//   - 2D/jagged : first line = row count R, then R lines each a
//                 space-separated row (possibly empty)
//   - "design" problems (a class exercised by a sequence of operations,
//     e.g. MinStack): starter code's Main reads an operation count and
//     then that many "OpName arg1 arg2..." lines, dispatches to the
//     class, and prints one line per operation that returns a value
//     (void operations print nothing) -- see e.g. min-stack below.
//
// Categories and problems mirror the Notes section (server/notesData.js)
// topic-for-topic, in the same order -- see that file's own header
// comment for the full topic-to-category mapping.
//
// To add more problems later, just append entries here and re-run
// `npm run seed` -- seeding upserts by slug, and also deletes any
// problem/category whose slug is no longer present here (see seed.js).

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

const problems = [
  // ================= arrays-big-o =================
  {
    slug: 'find-maximum', category: 'arrays-big-o', title: 'Find the Maximum Value', difficulty: 'Easy',
    description_html: `<p>Read an array of integers <code>nums</code> from one line of standard input (space-separated), and print the maximum value in the array.</p>
<p>Aim for a single pass, O(n) time -- see the Big-O section of the Single-Dimension Arrays note.</p>
<p><b>Input:</b> one line, space-separated integers.<br/><b>Output:</b> the maximum value.</p>
<p><b>Example:</b> input <code>3 1 4 1 5 9 2 6</code> &rarr; output <code>9</code></p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] nums = ParseInts(Console.ReadLine());
        Console.WriteLine(FindMaximum(nums));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int FindMaximum(int[] nums)
    {
        // your code here
    }
}`,
    tests: [
      { input: '3 1 4 1 5 9 2 6', expectedOutput: '9' },
      { input: '-5 -1 -10', expectedOutput: '-1' },
      { input: '7', expectedOutput: '7' },
      { input: '2 2 2', expectedOutput: '2' },
    ],
  },
  {
    slug: 'remove-duplicates-sorted', category: 'arrays-big-o', title: 'Remove Duplicates from Sorted Array', difficulty: 'Medium',
    description_html: `<p>Read a sorted array <code>nums</code> from one line. Remove duplicates in place so each unique value appears once, keeping order, and print two lines: the count of unique elements <code>k</code>, then the first <code>k</code> elements (the unique part) space-separated.</p>
<p>This is exactly the "shifting" cost the note warns about when inserting/removing from the middle of an array.</p>
<p><b>Input:</b> one line, sorted space-separated integers.<br/><b>Output:</b> two lines -- <code>k</code>, then the unique elements.</p>
<p><b>Example:</b> input <code>0 0 1 1 1 2 2 3 3 4</code> &rarr; output <code>5</code> then <code>0 1 2 3 4</code></p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] nums = ParseInts(Console.ReadLine());
        int k = RemoveDuplicates(nums);
        Console.WriteLine(k);
        int[] unique = new int[k];
        Array.Copy(nums, unique, k);
        Console.WriteLine(string.Join(" ", unique));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    // Mutate nums in place, return the count of unique elements.
    static int RemoveDuplicates(int[] nums)
    {
        // your code here
    }
}`,
    tests: [
      { input: '1 1 2', expectedOutput: '2\n1 2' },
      { input: '0 0 1 1 1 2 2 3 3 4', expectedOutput: '5\n0 1 2 3 4' },
      { input: '1 2 3', expectedOutput: '3\n1 2 3' },
    ],
  },
  {
    slug: 'max-subarray', category: 'arrays-big-o', title: "Maximum Subarray Sum (Kadane's Algorithm)", difficulty: 'Hard',
    description_html: `<p>Read an integer array <code>nums</code> from one line. Find the contiguous subarray (containing at least one number) with the largest sum, and print that sum.</p>
<p>A brute-force solution is O(n<sup>2</sup>); try to find the O(n) approach (Kadane's algorithm) -- a good test of the Big-O rules from the note (one pass, adding, not nesting).</p>
<p><b>Input:</b> one line, space-separated integers.<br/><b>Output:</b> the maximum subarray sum.</p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] nums = ParseInts(Console.ReadLine());
        Console.WriteLine(MaxSubArray(nums));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int MaxSubArray(int[] nums)
    {
        // your code here
    }
}`,
    tests: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6' },
      { input: '1', expectedOutput: '1' },
      { input: '5 4 -1 7 8', expectedOutput: '23' },
      { input: '-1 -2 -3', expectedOutput: '-1' },
    ],
  },

  // ================= searching =================
  {
    slug: 'linear-search', category: 'searching', title: 'Implement Linear Search', difficulty: 'Easy',
    description_html: `<p>Read an array <code>arr</code> (line 1) and a <code>target</code> (line 2). Print the index of <code>target</code> in <code>arr</code>, or <code>-1</code> if it isn't present. Check elements one at a time, in order -- this is the exact algorithm from the Linear Search note.</p>
<p><b>Input:</b> line 1 = space-separated integers, line 2 = target integer.<br/><b>Output:</b> the index, or -1.</p>
<p><b>Example:</b> input <code>4 2 9 6</code> / <code>9</code> &rarr; output <code>2</code></p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] arr = ParseInts(Console.ReadLine());
        int target = int.Parse(Console.ReadLine() ?? "0");
        Console.WriteLine(LinearSearch(arr, target));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int LinearSearch(int[] arr, int target)
    {
        // your code here
    }
}`,
    tests: [
      { input: '4 2 9 6\n9', expectedOutput: '2' },
      { input: '4 2 9 6\n7', expectedOutput: '-1' },
      { input: '5 5 5\n5', expectedOutput: '0' },
      { input: '\n1', expectedOutput: '-1' },
    ],
  },
  {
    slug: 'binary-search', category: 'searching', title: 'Implement Binary Search', difficulty: 'Easy',
    description_html: `<p>Read a <b>sorted</b> array <code>arr</code> (line 1) and a <code>target</code> (line 2). Print the index of <code>target</code>, or <code>-1</code> if it isn't present. Implement it yourself -- don't call <code>Array.BinarySearch</code>. This is the exact algorithm and trace from the Binary Search note.</p>
<p><b>Input:</b> line 1 = sorted space-separated integers, line 2 = target integer.<br/><b>Output:</b> the index, or -1.</p>
<p><b>Example:</b> input <code>1 3 5 7 9 11 13</code> / <code>9</code> &rarr; output <code>4</code></p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] arr = ParseInts(Console.ReadLine());
        int target = int.Parse(Console.ReadLine() ?? "0");
        Console.WriteLine(BinarySearch(arr, target));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int BinarySearch(int[] arr, int target)
    {
        // your code here
    }
}`,
    tests: [
      { input: '1 3 5 7 9 11 13\n9', expectedOutput: '4' },
      { input: '1 3 5 7 9 11 13\n1', expectedOutput: '0' },
      { input: '1 3 5 7 9 11 13\n13', expectedOutput: '6' },
      { input: '1 3 5 7 9 11 13\n4', expectedOutput: '-1' },
    ],
  },
  {
    slug: 'search-insert-position', category: 'searching', title: 'Search Insert Position', difficulty: 'Medium',
    description_html: `<p>Read a sorted array of distinct integers <code>nums</code> (line 1) and a <code>target</code> (line 2). Print the index if <code>target</code> is found; if not, print the index where it would be inserted to keep the array sorted.</p>
<p>Must run in O(log n) -- a small twist on binary search: instead of returning <code>-1</code> when the search space closes, return <code>lo</code>, which ends up exactly where the target belongs.</p>
<p><b>Example:</b> input <code>1 3 5 6</code> / <code>5</code> &rarr; output <code>2</code></p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] nums = ParseInts(Console.ReadLine());
        int target = int.Parse(Console.ReadLine() ?? "0");
        Console.WriteLine(SearchInsert(nums, target));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int SearchInsert(int[] nums, int target)
    {
        // your code here
    }
}`,
    tests: [
      { input: '1 3 5 6\n5', expectedOutput: '2' },
      { input: '1 3 5 6\n2', expectedOutput: '1' },
      { input: '1 3 5 6\n7', expectedOutput: '4' },
      { input: '1 3 5 6\n0', expectedOutput: '0' },
    ],
  },
  {
    slug: 'first-last-position', category: 'searching', title: 'First and Last Position of an Element in Sorted Array', difficulty: 'Hard',
    description_html: `<p>Read a sorted array <code>nums</code> (line 1, may contain duplicates) and a <code>target</code> (line 2). Print <code>first last</code> (space-separated) marking the run of <code>target</code> values, or <code>-1 -1</code> if not present.</p>
<p>Must run in O(log n) overall -- one binary search that hunts for the leftmost occurrence, and one that hunts for the rightmost, rather than a linear scan outward from any single match.</p>
<p><b>Example:</b> input <code>5 7 7 8 8 10</code> / <code>8</code> &rarr; output <code>3 4</code></p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] nums = ParseInts(Console.ReadLine());
        int target = int.Parse(Console.ReadLine() ?? "0");
        int[] range = SearchRange(nums, target);
        Console.WriteLine(range[0] + " " + range[1]);
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int[] SearchRange(int[] nums, int target)
    {
        // your code here -- return new int[] { first, last }
    }
}`,
    tests: [
      { input: '5 7 7 8 8 10\n8', expectedOutput: '3 4' },
      { input: '5 7 7 8 8 10\n6', expectedOutput: '-1 -1' },
      { input: '\n0', expectedOutput: '-1 -1' },
      { input: '2 2 2 2\n2', expectedOutput: '0 3' },
    ],
  },

  // ================= sorting =================
  {
    slug: 'selection-sort', category: 'sorting', title: 'Implement Selection Sort', difficulty: 'Easy',
    description_html: `<p>Read an array <code>nums</code> from one line. Implement selection sort exactly as shown in the note: repeatedly find the minimum of the unsorted remainder and swap it into place. Print the sorted array, space-separated.</p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] nums = ParseInts(Console.ReadLine());
        int[] sorted = SelectionSort(nums);
        Console.WriteLine(string.Join(" ", sorted));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int[] SelectionSort(int[] nums)
    {
        int[] arr = (int[])nums.Clone();
        // your selection sort implementation here
        return arr;
    }
}`,
    tests: [
      { input: '64 25 12 22 11', expectedOutput: '11 12 22 25 64' },
      { input: '1 2 3', expectedOutput: '1 2 3' },
      { input: '', expectedOutput: '' },
      { input: '5 3 8 4', expectedOutput: '3 4 5 8' },
    ],
  },
  {
    slug: 'insertion-sort', category: 'sorting', title: 'Implement Insertion Sort', difficulty: 'Easy',
    description_html: `<p>Read an array <code>nums</code> from one line. Implement insertion sort exactly as shown in the note: grow a sorted prefix at the front, sliding each new element left past everything bigger. Print the sorted array, space-separated.</p>
<p>Try it on a reverse-sorted array too -- that's insertion sort's worst case, where every element slides all the way to the front.</p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] nums = ParseInts(Console.ReadLine());
        int[] sorted = InsertionSort(nums);
        Console.WriteLine(string.Join(" ", sorted));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int[] InsertionSort(int[] nums)
    {
        int[] arr = (int[])nums.Clone();
        // your insertion sort implementation here
        return arr;
    }
}`,
    tests: [
      { input: '5 3 8 4', expectedOutput: '3 4 5 8' },
      { input: '9 7 5 3 1', expectedOutput: '1 3 5 7 9' },
      { input: '1', expectedOutput: '1' },
      { input: '', expectedOutput: '' },
    ],
  },
  {
    slug: 'insert-into-sorted-array', category: 'sorting', title: 'Insert into a Sorted Array', difficulty: 'Medium',
    description_html: `<p>Read a sorted array <code>arr</code> (line 1) and a new <code>value</code> (line 2). Print the resulting sorted array (space-separated) with <code>value</code> inserted in the correct position.</p>
<p>This is exactly one iteration of insertion sort's inner loop, isolated: sliding elements right to make room for the new value, then dropping it into the gap.</p>
<p><b>Example:</b> input <code>1 3 5 7</code> / <code>4</code> &rarr; output <code>1 3 4 5 7</code></p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] arr = ParseInts(Console.ReadLine());
        int value = int.Parse(Console.ReadLine() ?? "0");
        int[] result = InsertSorted(arr, value);
        Console.WriteLine(string.Join(" ", result));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int[] InsertSorted(int[] arr, int value)
    {
        // your code here
    }
}`,
    tests: [
      { input: '1 3 5 7\n4', expectedOutput: '1 3 4 5 7' },
      { input: '\n1', expectedOutput: '1' },
      { input: '2 4 6\n1', expectedOutput: '1 2 4 6' },
      { input: '2 4 6\n10', expectedOutput: '2 4 6 10' },
    ],
  },
  {
    slug: 'minimum-swaps-to-sort', category: 'sorting', title: 'Minimum Swaps to Sort', difficulty: 'Hard',
    description_html: `<p>Read an array <code>nums</code> of distinct integers from one line. Print the minimum number of swaps needed to sort it in ascending order.</p>
<p>This is exactly what the Selection Sort note means by "the number of swaps is only O(n) total": selection sort, if it skips swapping an element that's already in its correct spot, performs the true minimum number of swaps possible -- no algorithm can sort the array in fewer. Simulating that (only swap when the minimum isn't already in place) solves this directly.</p>
<p><b>Example:</b> input <code>4 3 2 1</code> &rarr; output <code>2</code></p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] nums = ParseInts(Console.ReadLine());
        Console.WriteLine(MinSwapsToSort(nums));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int MinSwapsToSort(int[] nums)
    {
        // your code here
    }
}`,
    tests: [
      { input: '4 3 2 1', expectedOutput: '2' },
      { input: '1 5 4 3 2', expectedOutput: '2' },
      { input: '1 2 3', expectedOutput: '0' },
      { input: '2 1', expectedOutput: '1' },
    ],
  },

  // ================= multi-dimensional-arrays =================
  {
    slug: 'matrix-sum', category: 'multi-dimensional-arrays', title: 'Sum of a 2D Matrix', difficulty: 'Easy',
    description_html: `<p>Read a matrix: line 1 is the row count <code>R</code>, followed by <code>R</code> lines each a space-separated row. Print the sum of all its elements.</p>
<p><b>Example:</b> input <code>2</code> / <code>1 2</code> / <code>3 4</code> &rarr; output <code>10</code></p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[][] matrix = ParseMatrix();
        Console.WriteLine(SumMatrix(matrix));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int[][] ParseMatrix()
    {
        int r = int.Parse(Console.ReadLine() ?? "0");
        int[][] matrix = new int[r][];
        for (int i = 0; i < r; i++) matrix[i] = ParseInts(Console.ReadLine());
        return matrix;
    }

    static int SumMatrix(int[][] matrix)
    {
        // your code here
    }
}`,
    tests: [
      { input: '2\n1 2\n3 4', expectedOutput: '10' },
      { input: '1\n5', expectedOutput: '5' },
      { input: '2\n1 1 1\n1 1 1', expectedOutput: '6' },
    ],
  },
  {
    slug: 'flatten-jagged-array', category: 'multi-dimensional-arrays', title: 'Flatten a Jagged Array', difficulty: 'Easy',
    description_html: `<p>Read a jagged matrix (rows of different lengths): line 1 is the row count <code>R</code>, followed by <code>R</code> lines each a space-separated row (a row may be empty). Print all values flattened into one line, preserving order -- this is the exact <code>FlattenJagged</code> example from the Jagged Arrays note.</p>
<p><b>Example:</b> input <code>3</code> / <code>1 2 3</code> / <code>4</code> / <code>5 6</code> &rarr; output <code>1 2 3 4 5 6</code></p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        int[][] jagged = ParseMatrix();
        List<int> flat = FlattenJagged(jagged);
        Console.WriteLine(string.Join(" ", flat));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int[][] ParseMatrix()
    {
        int r = int.Parse(Console.ReadLine() ?? "0");
        int[][] matrix = new int[r][];
        for (int i = 0; i < r; i++) matrix[i] = ParseInts(Console.ReadLine());
        return matrix;
    }

    static List<int> FlattenJagged(int[][] jagged)
    {
        // your code here
    }
}`,
    tests: [
      { input: '3\n1 2 3\n4\n5 6', expectedOutput: '1 2 3 4 5 6' },
      { input: '3\n\n1\n', expectedOutput: '1' },
    ],
  },
  {
    slug: 'transpose-matrix', category: 'multi-dimensional-arrays', title: 'Transpose a Matrix', difficulty: 'Medium',
    description_html: `<p>Read a rectangular matrix (line 1 = row count <code>R</code>, then <code>R</code> rows). Print its transpose (rows become columns) -- the exact <code>Transpose</code> example from the Multi-Dimensional Arrays note -- one output row per line.</p>
<p><b>Example:</b> input <code>2</code> / <code>1 2 3</code> / <code>4 5 6</code> &rarr; output <code>1 4</code> / <code>2 5</code> / <code>3 6</code></p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[][] matrix = ParseMatrix();
        int[][] result = Transpose(matrix);
        foreach (var row in result) Console.WriteLine(string.Join(" ", row));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int[][] ParseMatrix()
    {
        int r = int.Parse(Console.ReadLine() ?? "0");
        int[][] matrix = new int[r][];
        for (int i = 0; i < r; i++) matrix[i] = ParseInts(Console.ReadLine());
        return matrix;
    }

    static int[][] Transpose(int[][] matrix)
    {
        // your code here
    }
}`,
    tests: [
      { input: '2\n1 2 3\n4 5 6', expectedOutput: '1 4\n2 5\n3 6' },
      { input: '1\n1', expectedOutput: '1' },
    ],
  },
  {
    slug: 'row-with-max-sum', category: 'multi-dimensional-arrays', title: 'Row with Maximum Sum', difficulty: 'Medium',
    description_html: `<p>Read a matrix (line 1 = row count <code>R</code>, then <code>R</code> rows). Print the index (0-based) of the row whose elements have the largest sum.</p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[][] matrix = ParseMatrix();
        Console.WriteLine(RowWithMaxSum(matrix));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int[][] ParseMatrix()
    {
        int r = int.Parse(Console.ReadLine() ?? "0");
        int[][] matrix = new int[r][];
        for (int i = 0; i < r; i++) matrix[i] = ParseInts(Console.ReadLine());
        return matrix;
    }

    static int RowWithMaxSum(int[][] matrix)
    {
        // your code here
    }
}`,
    tests: [
      { input: '3\n1 2\n10 10\n0 1', expectedOutput: '1' },
      { input: '3\n5\n1\n3', expectedOutput: '0' },
    ],
  },
  {
    slug: 'spiral-traversal', category: 'multi-dimensional-arrays', title: 'Spiral Matrix Traversal', difficulty: 'Hard',
    description_html: `<p>Read a matrix (line 1 = row count <code>R</code>, then <code>R</code> rows). Print all elements in spiral order (clockwise, starting top-left) on one line -- the exact spiral pattern walked through in the Multi-Dimensional Arrays note.</p>
<p><b>Example:</b> input <code>3</code> / <code>1 2 3</code> / <code>4 5 6</code> / <code>7 8 9</code> &rarr; output <code>1 2 3 6 9 8 7 4 5</code></p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        int[][] matrix = ParseMatrix();
        List<int> order = SpiralOrder(matrix);
        Console.WriteLine(string.Join(" ", order));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int[][] ParseMatrix()
    {
        int r = int.Parse(Console.ReadLine() ?? "0");
        int[][] matrix = new int[r][];
        for (int i = 0; i < r; i++) matrix[i] = ParseInts(Console.ReadLine());
        return matrix;
    }

    static List<int> SpiralOrder(int[][] matrix)
    {
        // your code here
    }
}`,
    tests: [
      { input: '3\n1 2 3\n4 5 6\n7 8 9', expectedOutput: '1 2 3 6 9 8 7 4 5' },
      { input: '2\n1 2\n3 4', expectedOutput: '1 2 4 3' },
    ],
  },

  // ================= arraylists-adt =================
  {
    slug: 'remove-by-value', category: 'arraylists-adt', title: 'Remove First Occurrence by Value', difficulty: 'Easy',
    description_html: `<p>Read a list <code>list</code> (line 1) and a <code>value</code> (line 2). Print the array (space-separated) with the first occurrence of <code>value</code> removed (all other elements keep their order).</p>`,
    starter_code: `using System;
using System.Collections.Generic;
using System.Linq;

class Program
{
    static void Main()
    {
        int[] list = ParseInts(Console.ReadLine());
        int value = int.Parse(Console.ReadLine() ?? "0");
        int[] result = RemoveByValue(list, value);
        Console.WriteLine(string.Join(" ", result));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int[] RemoveByValue(int[] list, int value)
    {
        // your code here
    }
}`,
    tests: [
      { input: '1 2 3 2 4\n2', expectedOutput: '1 3 2 4' },
      { input: '1 2 3\n5', expectedOutput: '1 2 3' },
    ],
  },
  {
    slug: 'dynamic-array-list', category: 'arraylists-adt', title: 'Implement a Dynamic ArrayList', difficulty: 'Medium',
    description_html: `<p>Implement a class <code>MyArrayList</code> backed by a dynamic array -- the List ADT from the note: an interface (<code>Add</code>, <code>Get</code>, <code>Size</code>) that doesn't expose how it's stored underneath. A plain <code>List&lt;int&gt;</code> under the hood is fine -- the point is the public API.</p>
<ul><li><code>void Add(int value)</code> - append a value</li>
<li><code>int Get(int index)</code> - return the value at index</li>
<li><code>int Size()</code> - return the number of elements</li></ul>
<p><b>Input:</b> line 1 = number of operations <code>Q</code>; then <code>Q</code> lines, each <code>OpName</code> or <code>OpName arg</code> (one of <code>Add x</code>, <code>Get i</code>, <code>Size</code>).<br/><b>Output:</b> one line per operation that returns a value (<code>Get</code>, <code>Size</code>) -- <code>Add</code> prints nothing.</p>
<p>The provided <code>Main</code> already reads and dispatches operations -- you only need to implement the class.</p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var list = new MyArrayList();
        int q = int.Parse(Console.ReadLine() ?? "0");
        for (int i = 0; i < q; i++)
        {
            var parts = (Console.ReadLine() ?? "").Split(' ');
            switch (parts[0])
            {
                case "Add": list.Add(int.Parse(parts[1])); break;
                case "Get": Console.WriteLine(list.Get(int.Parse(parts[1]))); break;
                case "Size": Console.WriteLine(list.Size()); break;
            }
        }
    }
}

public class MyArrayList
{
    private List<int> items = new List<int>();

    public void Add(int value)
    {
        // your code here
    }

    public int Get(int index)
    {
        // your code here
    }

    public int Size()
    {
        // your code here
    }
}`,
    tests: [
      { input: '6\nAdd 1\nAdd 2\nGet 0\nSize\nAdd 3\nGet 2', expectedOutput: '1\n2\n3' },
    ],
  },
  {
    slug: 'rotate-array-left', category: 'arraylists-adt', title: 'Rotate Array Left by K', difficulty: 'Medium',
    description_html: `<p>Read an array <code>nums</code> (line 1) and an integer <code>k</code> (line 2). Print the array rotated left by <code>k</code> positions, space-separated.</p>
<p><b>Example:</b> input <code>1 2 3 4 5</code> / <code>2</code> &rarr; output <code>3 4 5 1 2</code></p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] nums = ParseInts(Console.ReadLine());
        int k = int.Parse(Console.ReadLine() ?? "0");
        int[] result = RotateLeft(nums, k);
        Console.WriteLine(string.Join(" ", result));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int[] RotateLeft(int[] nums, int k)
    {
        // your code here
    }
}`,
    tests: [
      { input: '1 2 3 4 5\n2', expectedOutput: '3 4 5 1 2' },
      { input: '1 2 3\n0', expectedOutput: '1 2 3' },
      { input: '1 2 3\n3', expectedOutput: '1 2 3' },
    ],
  },
  {
    slug: 'array-list-insert-at', category: 'arraylists-adt', title: 'Insert at Index', difficulty: 'Medium',
    description_html: `<p>Read a list <code>list</code> (line 1), an <code>index</code> (line 2), and a <code>value</code> (line 3). Print the array (space-separated) with <code>value</code> inserted at <code>index</code> (shifting later elements right), mirroring <code>List&lt;T&gt;.Insert</code>.</p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] list = ParseInts(Console.ReadLine());
        int index = int.Parse(Console.ReadLine() ?? "0");
        int value = int.Parse(Console.ReadLine() ?? "0");
        int[] result = InsertAt(list, index, value);
        Console.WriteLine(string.Join(" ", result));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int[] InsertAt(int[] list, int index, int value)
    {
        // your code here
    }
}`,
    tests: [
      { input: '1 2 4\n2\n3', expectedOutput: '1 2 3 4' },
      { input: '\n0\n1', expectedOutput: '1' },
    ],
  },
  {
    slug: 'dynamic-array-resize-count', category: 'arraylists-adt', title: 'Count Resizes in a Growable Array', difficulty: 'Hard',
    description_html: `<p>Implement a class <code>MyGrowList</code> that mimics how <code>List&lt;T&gt;</code> grows internally (see the note): it starts backed by an array of capacity <b>4</b>, and whenever <code>Add</code> is called with no room left, it allocates a new array of <b>double</b> the capacity, copies everything over, and only <i>then</i> stores the new value.</p>
<ul><li><code>void Add(int value)</code> - append a value, resizing first if the backing array is full</li>
<li><code>int ResizeCount()</code> - return how many times the backing array has been resized (doubled) so far</li></ul>
<p>This turns the note's "resizing happens only O(log n) times, so Add is O(1) amortized" claim into something you can directly count.</p>
<p><b>Input:</b> line 1 = number of operations <code>Q</code>; then <code>Q</code> lines, each <code>Add x</code> or <code>ResizeCount</code>.<br/><b>Output:</b> one line per <code>ResizeCount</code> call.</p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        var list = new MyGrowList();
        int q = int.Parse(Console.ReadLine() ?? "0");
        for (int i = 0; i < q; i++)
        {
            var parts = (Console.ReadLine() ?? "").Split(' ');
            switch (parts[0])
            {
                case "Add": list.Add(int.Parse(parts[1])); break;
                case "ResizeCount": Console.WriteLine(list.ResizeCount()); break;
            }
        }
    }
}

public class MyGrowList
{
    private int[] items = new int[4];
    private int count = 0;
    private int resizeCount = 0;

    public void Add(int value)
    {
        // your code here -- resize (doubling) before storing, if full
    }

    public int ResizeCount()
    {
        // your code here
    }
}`,
    tests: [
      {
        input: '13\nAdd 1\nAdd 2\nAdd 3\nAdd 4\nResizeCount\nAdd 5\nResizeCount\nAdd 6\nAdd 7\nAdd 8\nResizeCount\nAdd 9\nResizeCount',
        expectedOutput: '0\n1\n1\n2',
      },
    ],
  },

  // ================= stacks-queues =================
  {
    slug: 'valid-parentheses', category: 'stacks-queues', title: 'Valid Parentheses', difficulty: 'Easy',
    description_html: `<p>Read a string <code>s</code> containing just <code>()[]{}</code> characters from one line. Print <code>True</code> if it's valid (every opening bracket is closed by the same type, in the correct order), otherwise <code>False</code>. This is the exact bracket-matching pattern from the Stacks note.</p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        string s = Console.ReadLine() ?? "";
        Console.WriteLine(IsValid(s));
    }

    static bool IsValid(string s)
    {
        // your code here, use a Stack<char>
    }
}`,
    tests: [
      { input: '()[]{}', expectedOutput: 'True' },
      { input: '(]', expectedOutput: 'False' },
      { input: '{[]}', expectedOutput: 'True' },
      { input: '(', expectedOutput: 'False' },
    ],
  },
  {
    slug: 'min-stack', category: 'stacks-queues', title: 'Min Stack', difficulty: 'Medium',
    description_html: `<p>Implement a class <code>MinStack</code> supporting, all in O(1) time:</p>
<ul><li><code>void Push(int x)</code></li>
<li><code>void Pop()</code></li>
<li><code>int Top()</code> - return the top element</li>
<li><code>int GetMin()</code> - return the current minimum element</li></ul>
<p><b>Input:</b> line 1 = number of operations <code>Q</code>; then <code>Q</code> lines (<code>Push x</code>, <code>Pop</code>, <code>Top</code>, <code>GetMin</code>).<br/><b>Output:</b> one line per <code>Top</code>/<code>GetMin</code> call.</p>
<p>The provided <code>Main</code> already reads and dispatches operations -- you only need to implement the class.</p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var stack = new MinStack();
        int q = int.Parse(Console.ReadLine() ?? "0");
        for (int i = 0; i < q; i++)
        {
            var parts = (Console.ReadLine() ?? "").Split(' ');
            switch (parts[0])
            {
                case "Push": stack.Push(int.Parse(parts[1])); break;
                case "Pop": stack.Pop(); break;
                case "Top": Console.WriteLine(stack.Top()); break;
                case "GetMin": Console.WriteLine(stack.GetMin()); break;
            }
        }
    }
}

public class MinStack
{
    private Stack<int> stack = new Stack<int>();
    private Stack<int> minStack = new Stack<int>();

    public void Push(int x)
    {
        // your code here
    }

    public void Pop()
    {
        // your code here
    }

    public int Top()
    {
        // your code here
    }

    public int GetMin()
    {
        // your code here
    }
}`,
    tests: [
      { input: '7\nPush -2\nPush 0\nPush -3\nGetMin\nPop\nTop\nGetMin', expectedOutput: '-3\n0\n-2' },
    ],
  },
  {
    slug: 'queue-using-two-stacks', category: 'stacks-queues', title: 'Implement Queue using Two Stacks', difficulty: 'Medium',
    description_html: `<p>Implement a class <code>MyQueue</code> that implements a FIFO queue using only two <code>Stack&lt;int&gt;</code> fields -- the exact "queue from two stacks" trick from the Queues note, supporting:</p>
<ul><li><code>void Push(int x)</code> - add an element to the back</li>
<li><code>int Pop()</code> - remove and return the element at the front</li>
<li><code>int Peek()</code> - return the element at the front without removing it</li>
<li><code>bool Empty()</code> - return whether the queue is empty</li></ul>
<p><b>Input:</b> line 1 = number of operations <code>Q</code>; then <code>Q</code> lines (<code>Push x</code>, <code>Pop</code>, <code>Peek</code>, <code>Empty</code>).<br/><b>Output:</b> one line per <code>Pop</code>/<code>Peek</code>/<code>Empty</code> call.</p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        var queue = new MyQueue();
        int q = int.Parse(Console.ReadLine() ?? "0");
        for (int i = 0; i < q; i++)
        {
            var parts = (Console.ReadLine() ?? "").Split(' ');
            switch (parts[0])
            {
                case "Push": queue.Push(int.Parse(parts[1])); break;
                case "Pop": Console.WriteLine(queue.Pop()); break;
                case "Peek": Console.WriteLine(queue.Peek()); break;
                case "Empty": Console.WriteLine(queue.Empty()); break;
            }
        }
    }
}

public class MyQueue
{
    private Stack<int> inStack = new Stack<int>();
    private Stack<int> outStack = new Stack<int>();

    public void Push(int x)
    {
        // your code here
    }

    public int Pop()
    {
        // your code here
    }

    public int Peek()
    {
        // your code here
    }

    public bool Empty()
    {
        // your code here
    }
}`,
    tests: [
      { input: '5\nPush 1\nPush 2\nPeek\nPop\nEmpty', expectedOutput: '1\n1\nFalse' },
    ],
  },
  {
    slug: 'circular-queue', category: 'stacks-queues', title: 'Design Circular Queue', difficulty: 'Hard',
    description_html: `<p>Implement a class <code>MyCircularQueue</code> with a fixed capacity <code>k</code> -- the circular buffer approach the Queues note describes as how a real O(1) array-backed queue avoids ever shifting elements. Support:</p>
<ul><li><code>bool EnQueue(int value)</code> - returns <code>true</code> if successful</li>
<li><code>bool DeQueue()</code> - returns <code>true</code> if successful</li>
<li><code>int Rear()</code> - returns the last element, or <code>-1</code> if empty</li>
<li><code>bool IsFull()</code></li></ul>
<p><b>Input:</b> line 1 = capacity <code>k</code>; line 2 = number of operations <code>Q</code>; then <code>Q</code> lines (<code>EnQueue x</code>, <code>DeQueue</code>, <code>Rear</code>, <code>IsFull</code>).<br/><b>Output:</b> one line per operation (every one of these returns a value).</p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        int k = int.Parse(Console.ReadLine() ?? "0");
        var queue = new MyCircularQueue(k);
        int q = int.Parse(Console.ReadLine() ?? "0");
        for (int i = 0; i < q; i++)
        {
            var parts = (Console.ReadLine() ?? "").Split(' ');
            switch (parts[0])
            {
                case "EnQueue": Console.WriteLine(queue.EnQueue(int.Parse(parts[1]))); break;
                case "DeQueue": Console.WriteLine(queue.DeQueue()); break;
                case "Rear": Console.WriteLine(queue.Rear()); break;
                case "IsFull": Console.WriteLine(queue.IsFull()); break;
            }
        }
    }
}

public class MyCircularQueue
{
    private int capacity;
    private List<int> items = new List<int>();

    public MyCircularQueue(int k)
    {
        capacity = k;
    }

    public bool EnQueue(int value)
    {
        // your code here
    }

    public bool DeQueue()
    {
        // your code here
    }

    public int Rear()
    {
        // your code here
    }

    public bool IsFull()
    {
        // your code here
    }
}`,
    tests: [
      {
        input: '3\n9\nEnQueue 1\nEnQueue 2\nEnQueue 3\nEnQueue 4\nRear\nIsFull\nDeQueue\nEnQueue 4\nRear',
        expectedOutput: 'True\nTrue\nTrue\nFalse\n3\nTrue\nTrue\nTrue\n4',
      },
    ],
  },

  // ================= dictionaries =================
  {
    slug: 'two-sum', category: 'dictionaries', title: 'Two Sum', difficulty: 'Easy',
    description_html: `<p>Read an array <code>nums</code> (line 1) and an integer <code>target</code> (line 2). Print the two indices whose values add up to <code>target</code>, space-separated in ascending order. Assume exactly one solution exists.</p>
<p>This is the "trade space for time" example from the Dictionaries note itself: remember every number you've seen in a dictionary as you go, turning an O(n<sup>2</sup>) pair check into O(n).</p>
<p><b>Example:</b> input <code>2 7 11 15</code> / <code>9</code> &rarr; output <code>0 1</code></p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        int[] nums = ParseInts(Console.ReadLine());
        int target = int.Parse(Console.ReadLine() ?? "0");
        int[] result = TwoSum(nums, target);
        Console.WriteLine(result[0] + " " + result[1]);
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int[] TwoSum(int[] nums, int target)
    {
        // return the two indices as an array, e.g. new int[] { i, j }
    }
}`,
    tests: [
      { input: '2 7 11 15\n9', expectedOutput: '0 1' },
      { input: '3 2 4\n6', expectedOutput: '1 2' },
      { input: '3 3\n6', expectedOutput: '0 1' },
    ],
  },
  {
    slug: 'contains-duplicate', category: 'dictionaries', title: 'Contains Duplicate', difficulty: 'Easy',
    description_html: `<p>Read an array <code>nums</code> from one line. Print <code>True</code> if any value appears at least twice, and <code>False</code> if every element is distinct.</p>
<p>A <code>HashSet&lt;int&gt;</code> -- the note's suggested cousin of <code>Dictionary</code> for "have I seen this before?" checks -- solves this in one O(n) pass.</p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] nums = ParseInts(Console.ReadLine());
        Console.WriteLine(ContainsDuplicate(nums));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static bool ContainsDuplicate(int[] nums)
    {
        // your code here
    }
}`,
    tests: [
      { input: '1 2 3 1', expectedOutput: 'True' },
      { input: '1 2 3 4', expectedOutput: 'False' },
      { input: '', expectedOutput: 'False' },
      { input: '1 1 1 1', expectedOutput: 'True' },
    ],
  },
  {
    slug: 'first-unique-char', category: 'dictionaries', title: 'First Unique Character in a String', difficulty: 'Medium',
    description_html: `<p>Read a string <code>s</code> from one line. Print the index of the first character that appears exactly once, or <code>-1</code> if every character repeats.</p>
<p>Count every character's frequency in a dictionary in one pass, then scan once more looking for the first count of 1.</p>
<p><b>Example:</b> input <code>leetcode</code> &rarr; output <code>0</code></p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        string s = Console.ReadLine() ?? "";
        Console.WriteLine(FirstUniqChar(s));
    }

    static int FirstUniqChar(string s)
    {
        // your code here
    }
}`,
    tests: [
      { input: 'leetcode', expectedOutput: '0' },
      { input: 'loveleetcode', expectedOutput: '2' },
      { input: 'aabb', expectedOutput: '-1' },
      { input: '\n', expectedOutput: '-1' },
    ],
  },
  {
    slug: 'longest-consecutive-sequence', category: 'dictionaries', title: 'Longest Consecutive Sequence', difficulty: 'Hard',
    description_html: `<p>Read an unsorted array of integers <code>nums</code> from one line. Print the length of the longest run of consecutive integers (e.g. <code>1,2,3,4</code> has length 4), in O(n) time.</p>
<p>Sorting first would work but costs O(n log n). Instead, put every value in a <code>HashSet&lt;int&gt;</code>, and only start counting a run from a value <code>v</code> where <code>v - 1</code> is <i>not</i> in the set (i.e. <code>v</code> is the start of a run) -- that guarantees each run is only ever walked once, in total O(n) across the whole array.</p>
<p><b>Example:</b> input <code>100 4 200 1 3 2</code> &rarr; output <code>4</code></p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        int[] nums = ParseInts(Console.ReadLine());
        Console.WriteLine(LongestConsecutive(nums));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static int LongestConsecutive(int[] nums)
    {
        // your code here
    }
}`,
    tests: [
      { input: '100 4 200 1 3 2', expectedOutput: '4' },
      { input: '0 3 7 2 5 8 4 6 0 1', expectedOutput: '9' },
      { input: '', expectedOutput: '0' },
      { input: '5', expectedOutput: '1' },
    ],
  },

  // ================= linked-lists =================
  {
    slug: 'linked-list-length', category: 'linked-lists', title: 'Length of a Linked List', difficulty: 'Easy',
    description_html: `<p>Read the list's values from one line (space-separated; empty line = empty list). Build a real singly linked list from them, then print its length.</p>
<p>The <code>ListNode</code> class and the array/list conversion helpers are provided in the starter code -- you only need to implement <code>GetLength</code>.</p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        int[] values = ParseInts(Console.ReadLine());
        ListNode head = ArrayToList(values);
        Console.WriteLine(GetLength(head));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static ListNode ArrayToList(int[] arr)
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

    static int GetLength(ListNode head)
    {
        // your code here
    }
}

public class ListNode
{
    public int Val;
    public ListNode Next;
    public ListNode(int val, ListNode next = null)
    {
        Val = val;
        Next = next;
    }
}`,
    tests: [
      { input: '1 2 3 4', expectedOutput: '4' },
      { input: '', expectedOutput: '0' },
      { input: '1', expectedOutput: '1' },
    ],
  },
  {
    slug: 'reverse-linked-list', category: 'linked-lists', title: 'Reverse a Linked List', difficulty: 'Medium',
    description_html: `<p>Read the list's values from one line. Build a real singly linked list, reverse it, and print the resulting values space-separated -- the exact reversal walk-through from the note (re-pointing each node's <code>Next</code> back to the previous node).</p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        int[] values = ParseInts(Console.ReadLine());
        ListNode head = ArrayToList(values);
        ListNode reversed = ReverseList(head);
        Console.WriteLine(string.Join(" ", ListToArray(reversed)));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static ListNode ArrayToList(int[] arr)
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

    static List<int> ListToArray(ListNode head)
    {
        var result = new List<int>();
        while (head != null) { result.Add(head.Val); head = head.Next; }
        return result;
    }

    static ListNode ReverseList(ListNode head)
    {
        // your code here
    }
}

public class ListNode
{
    public int Val;
    public ListNode Next;
    public ListNode(int val, ListNode next = null)
    {
        Val = val;
        Next = next;
    }
}`,
    tests: [
      { input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1' },
      { input: '', expectedOutput: '' },
      { input: '1', expectedOutput: '1' },
    ],
  },
  {
    slug: 'linked-list-middle', category: 'linked-lists', title: 'Find the Middle Node', difficulty: 'Easy',
    description_html: `<p>Read the list's values from one line. Build a real singly linked list, and print the value of the middle node. If there are two middle nodes, print the value of the second one.</p>
<p>Use the fast/slow pointer pattern from the note: advance one pointer twice as fast as the other, and when the fast one reaches the end, the slow one is at the middle.</p>`,
    starter_code: `using System;

class Program
{
    static void Main()
    {
        int[] values = ParseInts(Console.ReadLine());
        ListNode head = ArrayToList(values);
        Console.WriteLine(FindMiddle(head).Val);
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static ListNode ArrayToList(int[] arr)
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

    static ListNode FindMiddle(ListNode head)
    {
        // your code here, return the middle ListNode
    }
}

public class ListNode
{
    public int Val;
    public ListNode Next;
    public ListNode(int val, ListNode next = null)
    {
        Val = val;
        Next = next;
    }
}`,
    tests: [
      { input: '1 2 3 4 5', expectedOutput: '3' },
      { input: '1 2 3 4 5 6', expectedOutput: '4' },
      { input: '1', expectedOutput: '1' },
    ],
  },
  {
    slug: 'linked-list-cycle', category: 'linked-lists', title: 'Linked List Cycle Detection', difficulty: 'Hard',
    description_html: `<p>Read the list's values (line 1) and <code>pos</code> (line 2) -- the index the tail connects back to, or <code>-1</code> for no cycle. Build the list (wiring the cycle if <code>pos &gt;= 0</code>), and print <code>True</code> or <code>False</code> for whether it contains a cycle.</p>
<p>This is the note's other fast/slow pointer (Floyd's algorithm) use case: if there's a cycle, a faster pointer will eventually lap a slower one and they'll meet, for O(1) extra space. The list-building and cycle-wiring code is provided -- you only need to implement <code>HasCycle</code>.</p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        int[] values = ParseInts(Console.ReadLine());
        int pos = int.Parse(Console.ReadLine() ?? "-1");
        ListNode head = BuildWithCycle(values, pos);
        Console.WriteLine(HasCycle(head));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static ListNode BuildWithCycle(int[] values, int pos)
    {
        var nodes = new List<ListNode>();
        ListNode head = null, tail = null;
        foreach (var v in values)
        {
            var node = new ListNode(v);
            nodes.Add(node);
            if (head == null) { head = tail = node; }
            else { tail.Next = node; tail = node; }
        }
        if (pos >= 0 && nodes.Count > 0) nodes[nodes.Count - 1].Next = nodes[pos];
        return head;
    }

    static bool HasCycle(ListNode head)
    {
        // your code here
    }
}

public class ListNode
{
    public int Val;
    public ListNode Next;
    public ListNode(int val, ListNode next = null)
    {
        Val = val;
        Next = next;
    }
}`,
    tests: [
      { input: '3 2 0 -4\n1', expectedOutput: 'True' },
      { input: '1 2\n-1', expectedOutput: 'False' },
      { input: '1\n-1', expectedOutput: 'False' },
    ],
  },
  {
    slug: 'remove-nth-from-end', category: 'linked-lists', title: 'Remove Nth Node From End', difficulty: 'Medium',
    description_html: `<p>Read the list's values (line 1) and an integer <code>n</code> (line 2). Build a real singly linked list, remove the <code>n</code>-th node from the end, and print the resulting values space-separated.</p>`,
    starter_code: `using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        int[] values = ParseInts(Console.ReadLine());
        int n = int.Parse(Console.ReadLine() ?? "0");
        ListNode head = ArrayToList(values);
        ListNode result = RemoveNthFromEnd(head, n);
        Console.WriteLine(string.Join(" ", ListToArray(result)));
    }

    static int[] ParseInts(string line)
    {
        if (string.IsNullOrEmpty(line)) return new int[0];
        return Array.ConvertAll(line.Split(' '), int.Parse);
    }

    static ListNode ArrayToList(int[] arr)
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

    static List<int> ListToArray(ListNode head)
    {
        var result = new List<int>();
        while (head != null) { result.Add(head.Val); head = head.Next; }
        return result;
    }

    static ListNode RemoveNthFromEnd(ListNode head, int n)
    {
        // your code here
    }
}

public class ListNode
{
    public int Val;
    public ListNode Next;
    public ListNode(int val, ListNode next = null)
    {
        Val = val;
        Next = next;
    }
}`,
    tests: [
      { input: '1 2 3 4 5\n2', expectedOutput: '1 2 3 5' },
      { input: '1\n1', expectedOutput: '' },
      { input: '1 2\n1', expectedOutput: '1' },
    ],
  },
];

module.exports = { categories, problems };
