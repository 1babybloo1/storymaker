
// This file is kept for potential future expansion of types.
// For now, most data like story ideas and paragraphs are handled as strings.

// Example of a more complex type if needed in the future:
// export interface StoryElement {
//   id: string;
//   type: 'idea' | 'paragraph' | 'character_note';
//   content: string;
//   createdAt: string;
// }

// Represents the state of an API call, can be used for more structured state management
export interface ApiCallState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}
