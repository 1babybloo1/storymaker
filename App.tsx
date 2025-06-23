import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ActionButton } from './components/ActionButton';
import { SectionCard } from './components/SectionCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { 
  fetchStoryIdeas as fetchIdeasService, 
  generateStoryParagraph as generateParagraphService,
  suggestStoryEdits as suggestEditsService 
} from './services/geminiService';
import { GEMINI_MODEL_TEXT } from './constants';

const App: React.FC = () => {
  const [storyIdeas, setStoryIdeas] = useState<string[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState<boolean>(false);
  const [errorIdeas, setErrorIdeas] = useState<string | null>(null);

  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  
  const [generatedParagraph, setGeneratedParagraph] = useState<string>('');
  const [isLoadingParagraph, setIsLoadingParagraph] = useState<boolean>(false);
  const [errorParagraph, setErrorParagraph] = useState<string | null>(null);

  const [storyContent, setStoryContent] = useState<string>('');

  const [suggestedStoryEdit, setSuggestedStoryEdit] = useState<string | null>(null);
  const [isLoadingEditSuggestions, setIsLoadingEditSuggestions] = useState<boolean>(false);
  const [errorEditSuggestions, setErrorEditSuggestions] = useState<string | null>(null);

  const handleFetchIdeas = useCallback(async () => {
    setIsLoadingIdeas(true);
    setErrorIdeas(null);
    setStoryIdeas([]);
    try {
      const ideas = await fetchIdeasService();
      setStoryIdeas(ideas);
    } catch (error) {
      console.error("Failed to fetch story ideas:", error);
      setErrorIdeas(error instanceof Error ? error.message : 'An unknown error occurred while fetching ideas.');
    } finally {
      setIsLoadingIdeas(false);
    }
  }, []);

  const handleGenerateParagraph = useCallback(async () => {
    if (!currentPrompt.trim()) {
      setErrorParagraph("Please enter a prompt first.");
      return;
    }
    setIsLoadingParagraph(true);
    setErrorParagraph(null);
    setGeneratedParagraph('');
    try {
      // Pass current storyContent for context-aware generation
      const paragraph = await generateParagraphService(currentPrompt, storyContent);
      setGeneratedParagraph(paragraph);
    } catch (error) {
      console.error("Failed to generate paragraph:", error);
      setErrorParagraph(error instanceof Error ? error.message : 'An unknown error occurred while generating the paragraph.');
    } finally {
      setIsLoadingParagraph(false);
    }
  }, [currentPrompt, storyContent]);

  const handleSelectIdea = useCallback((idea: string) => {
    setCurrentPrompt(idea);
    // Consider smooth scroll to prompt section
    const promptTextarea = document.getElementById('prompt-textarea');
    if (promptTextarea) {
        promptTextarea.focus();
        promptTextarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleAddParagraphToStory = useCallback(() => {
    if (generatedParagraph) {
      setStoryContent(prevContent => 
        prevContent ? `${prevContent}\n\n${generatedParagraph}` : generatedParagraph
      );
      setGeneratedParagraph(''); 
      // Optionally clear currentPrompt as well or provide feedback
      // setCurrentPrompt('');
    }
  }, [generatedParagraph]);

  const handleSuggestEdits = useCallback(async () => {
    if (!storyContent.trim()) {
      setErrorEditSuggestions("There's no story content to edit yet. Write something in 'Your Masterpiece' first!");
      return;
    }
    setIsLoadingEditSuggestions(true);
    setErrorEditSuggestions(null);
    setSuggestedStoryEdit(null);
    try {
      const suggestion = await suggestEditsService(storyContent);
      setSuggestedStoryEdit(suggestion);
    } catch (error) {
      console.error("Failed to suggest edits:", error);
      setErrorEditSuggestions(error instanceof Error ? error.message : 'An unknown error occurred while suggesting edits.');
    } finally {
      setIsLoadingEditSuggestions(false);
    }
  }, [storyContent]);

  const handleApplyEditSuggestion = useCallback(() => {
    if (suggestedStoryEdit) {
      setStoryContent(suggestedStoryEdit);
      setSuggestedStoryEdit(null); // Clear suggestion after applying
    }
  }, [suggestedStoryEdit]);

  const handleDiscardEditSuggestion = useCallback(() => {
    setSuggestedStoryEdit(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        
        <SectionCard 
          title="Brainstorm Ideas"
          actions={
            <ActionButton onClick={handleFetchIdeas} isLoading={isLoadingIdeas} variant="primary">
              {isLoadingIdeas ? 'Sparking...' : 'Get Story Ideas'}
            </ActionButton>
          }
        >
          {isLoadingIdeas && <div className="flex justify-center p-4"><LoadingSpinner /></div>}
          {errorIdeas && <ErrorMessage message={errorIdeas} />}
          {!isLoadingIdeas && storyIdeas.length === 0 && !errorIdeas && (
            <p className="text-slate-400 italic">Click "Get Story Ideas" to ignite your imagination!</p>
          )}
          {storyIdeas.length > 0 && (
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {storyIdeas.map((idea, index) => (
                <li 
                  key={index} 
                  onClick={() => handleSelectIdea(idea)}
                  className="p-3 bg-slate-700/80 rounded-md hover:bg-slate-600/90 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
                  aria-label={`Select idea: ${idea}`}
                >
                  {idea}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard 
          title="Craft Your Prompt"
          actions={
            <ActionButton onClick={handleGenerateParagraph} isLoading={isLoadingParagraph} disabled={!currentPrompt.trim()} variant="primary">
              {isLoadingParagraph ? 'Writing...' : 'Generate Paragraph'}
            </ActionButton>
          }
        >
          <textarea
            id="prompt-textarea"
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            placeholder="Enter your story prompt here, or select an idea above..."
            rows={4}
            className="w-full p-3 bg-slate-700/80 border border-slate-600/70 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors text-slate-100 placeholder-slate-400"
            aria-label="Story prompt input"
          />
        </SectionCard>

        { (isLoadingParagraph || errorParagraph || generatedParagraph) && (
          <SectionCard 
            title="AI-Generated Paragraph"
            actions={
              generatedParagraph && (
                <ActionButton onClick={handleAddParagraphToStory} variant="secondary">
                  Add to My Story
                </ActionButton>
              )
            }
          >
            {isLoadingParagraph && <div className="flex justify-center p-4"><LoadingSpinner /></div>}
            {errorParagraph && <ErrorMessage message={errorParagraph} />}
            {!isLoadingParagraph && !generatedParagraph && !errorParagraph && (
              <p className="text-slate-400 italic">Your AI-generated paragraph will appear here.</p>
            )}
            {generatedParagraph && (
              <div className="p-4 bg-slate-700/80 rounded-md whitespace-pre-wrap min-h-[60px] text-slate-200">
                {generatedParagraph}
              </div>
            )}
          </SectionCard>
        )}

        <SectionCard title="Your Masterpiece">
          <textarea
            value={storyContent}
            onChange={(e) => setStoryContent(e.target.value)}
            placeholder="Start writing your story here... Use the AI assistance above to build it paragraph by paragraph, or write freely! Then, ask the AI to refine your work."
            rows={15}
            className="w-full p-3 bg-slate-800/90 border border-slate-700/80 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors text-slate-100 placeholder-slate-400"
            aria-label="Main story content editor"
          />
          <div className="mt-4 flex justify-end">
            <ActionButton 
              onClick={handleSuggestEdits} 
              isLoading={isLoadingEditSuggestions} 
              disabled={!storyContent.trim() || isLoadingEditSuggestions}
              variant="secondary"
            >
              {isLoadingEditSuggestions ? 'Analyzing...' : 'Refine with AI'}
            </ActionButton>
          </div>
        </SectionCard>

        { (isLoadingEditSuggestions || errorEditSuggestions || suggestedStoryEdit) && (
          <SectionCard 
            title="AI Edit Suggestion"
            actions={
              suggestedStoryEdit && !isLoadingEditSuggestions && (
                <div className="flex space-x-3">
                  <ActionButton onClick={handleApplyEditSuggestion} variant="primary">
                    Apply Suggestion
                  </ActionButton>
                  <ActionButton onClick={handleDiscardEditSuggestion} variant="secondary" className="bg-slate-600 hover:bg-slate-500">
                    Discard
                  </ActionButton>
                </div>
              )
            }
          >
            {isLoadingEditSuggestions && <div className="flex justify-center p-4"><LoadingSpinner /></div>}
            {errorEditSuggestions && <ErrorMessage message={errorEditSuggestions} />}
            {suggestedStoryEdit && !isLoadingEditSuggestions && (
              <div 
                className="p-4 bg-slate-700/80 rounded-md whitespace-pre-wrap min-h-[100px] max-h-[400px] overflow-y-auto text-slate-200"
                aria-label="AI suggested edit"
              >
                {suggestedStoryEdit}
              </div>
            )}
            {!isLoadingEditSuggestions && !suggestedStoryEdit && !errorEditSuggestions && (
                 <p className="text-slate-400 italic">AI's refined version of your story will appear here.</p>
            )}
          </SectionCard>
        )}

      </main>
      <footer className="text-center p-6 text-slate-400 text-sm bg-transparent">
        Powered by Google Gemini API. Model: {GEMINI_MODEL_TEXT}
      </footer>
    </div>
  );
};

export default App;