import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, ArrowRight, Sparkles, Crown } from "lucide-react";
import { useLocation } from "wouter";

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{
    value: string;
    label: string;
    traits: string[];
  }>;
}

interface QuizResult {
  personality: string;
  traits: string[];
  interests: string[];
  style: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: "vibe",
    question: "What's your ideal weekend vibe?",
    options: [
      { value: "social", label: "Social time - parties, events, making memories with friends", traits: ["social", "social-butterfly", "outgoing"] },
      { value: "creative", label: "Creative projects - art, music, content creation", traits: ["creative", "artistic", "maker"] },
      { value: "learning", label: "Learning time - podcasts, documentaries, reading", traits: ["intellectual", "curious", "learner"] },
      { value: "outdoors", label: "Outdoor adventures - hiking, beach days, exploring nature", traits: ["nature-lover", "active", "adventurous"] }
    ]
  },
  {
    id: "communication",
    question: "How do you communicate with others?",
    options: [
      { value: "humor", label: "With humor - memes, wit, playful jokes", traits: ["funny", "witty", "playful"] },
      { value: "thoughtful", label: "Thoughtfully - deep conversations, emotional intelligence", traits: ["empathetic", "thoughtful", "deep"] },
      { value: "direct", label: "Directly - straight facts, authentic and honest", traits: ["authentic", "honest", "straightforward"] },
      { value: "positive", label: "Positively - good vibes, optimistic outlook", traits: ["optimistic", "positive", "uplifting"] }
    ]
  },
  {
    id: "content",
    question: "Your social feeds are filled with...",
    options: [
      { value: "tech", label: "Tech content - AI updates, coding, future tech", traits: ["tech-savvy", "future-focused", "digital"] },
      { value: "aesthetic", label: "Art, fashion, music, and aesthetic content", traits: ["aesthetic", "artistic", "trendy"] },
      { value: "lifestyle", label: "Travel vlogs, food content, life experiences", traits: ["wanderlust", "foodie", "explorer"] },
      { value: "activism", label: "Social justice, activism, making positive change", traits: ["activist", "conscious", "change-maker"] }
    ]
  },
  {
    id: "energy",
    question: "What energizes you most?",
    options: [
      { value: "social", label: "People connections - building community, networking", traits: ["people-person", "community-builder", "social"] },
      { value: "problem_solving", label: "Problem solving - tackling challenges, achieving goals", traits: ["problem-solver", "goal-oriented", "strategic"] },
      { value: "creating", label: "Creating things - building, making, innovating", traits: ["builder", "innovator", "creative"] },
      { value: "growth", label: "Personal growth - learning, evolving, improving", traits: ["growth-minded", "learner", "evolving"] }
    ]
  },
  {
    id: "aesthetic",
    question: "Pick your aesthetic style",
    options: [
      { value: "maximalist", label: "Maximalist - bold colors, patterns, more is more", traits: ["maximalist", "bold", "vibrant"] },
      { value: "minimalist", label: "Minimalist - clean, simple, understated elegance", traits: ["minimalist", "clean", "effortless"] },
      { value: "vintage", label: "Vintage - thrift finds, retro styles, classic looks", traits: ["vintage-lover", "nostalgic", "unique"] },
      { value: "futuristic", label: "Modern - tech wear, contemporary, cutting-edge", traits: ["futuristic", "modern", "innovative"] }
    ]
  },
  {
    id: "social",
    question: "How do you show up in group settings? 👯‍♀️",
    options: [
      { value: "spotlight", label: "Natural spotlight stealer - storyteller, entertainment committee 🎭", traits: ["entertainer", "storyteller", "magnetic"] },
      { value: "supportive", label: "Support system bestie - listening, hyping others up 💕", traits: ["supportive", "empathetic", "loyal"] },
      { value: "observer", label: "Silent observer - reading the room, strategic contributions 👁️", traits: ["observant", "strategic", "thoughtful"] },
      { value: "connector", label: "Social connector - introducing people, building bridges 🌉", traits: ["connector", "networker", "bridge-builder"] }
    ]
  },
  {
    id: "values",
    question: "What hits different for you? 💎",
    options: [
      { value: "authenticity", label: "Authenticity over everything - real recognizes real 💯", traits: ["authentic", "genuine", "truth-teller"] },
      { value: "creativity", label: "Creative expression - art is life, beauty in everything 🎨", traits: ["creative", "artistic", "expressive"] },
      { value: "growth", label: "Personal growth - constantly evolving, self-optimization 📈", traits: ["growth-oriented", "ambitious", "evolving"] },
      { value: "connection", label: "Human connection - relationships, community, belonging 🤝", traits: ["community-focused", "relationship-builder", "caring"] }
    ]
  },
  {
    id: "humor",
    question: "Your humor style is... 😂",
    options: [
      { value: "chaos", label: "Chaotic neutral - random thoughts, unhinged observations 🤡", traits: ["chaotic", "random", "unpredictable"] },
      { value: "witty", label: "Sharp wit - clever comebacks, intellectual humor 🧠", traits: ["witty", "intelligent", "sharp"] },
      { value: "wholesome", label: "Wholesome energy - dad jokes, puns, innocent humor ☺️", traits: ["wholesome", "pure", "innocent"] },
      { value: "sarcastic", label: "Sarcasm is my love language - dry humor, subtle roasts 💅", traits: ["sarcastic", "dry-humor", "subtle"] }
    ]
  },
  {
    id: "motivation",
    question: "What motivates you to get out of bed? ⚡",
    options: [
      { value: "impact", label: "Making an impact - changing the world, leaving a mark 🌍", traits: ["impact-driven", "ambitious", "world-changer"] },
      { value: "creation", label: "Creating something beautiful - art, content, experiences 🎭", traits: ["creator", "artist", "maker"] },
      { value: "connection", label: "Connecting with people - relationships, conversations, love 💞", traits: ["people-oriented", "relationship-focused", "loving"] },
      { value: "adventure", label: "New adventures - experiences, travel, discoveries 🗺️", traits: ["adventurous", "explorer", "experience-seeker"] }
    ]
  },
  {
    id: "future",
    question: "In 5 years, you're living your best life by... 🌟",
    options: [
      { value: "influence", label: "Having influence - platform, voice, making change happen 📢", traits: ["influential", "leader", "voice"] },
      { value: "mastery", label: "Mastering your craft - expertise, skills, being the best 🏆", traits: ["master", "expert", "skilled"] },
      { value: "balance", label: "Perfect work-life balance - peace, fulfillment, happiness ⚖️", traits: ["balanced", "peaceful", "fulfilled"] },
      { value: "legacy", label: "Building a legacy - something that lasts, generational impact 🏛️", traits: ["legacy-builder", "long-term-thinker", "impactful"] }
    ]
  }
];

interface PersonalityQuizProps {
  onComplete: (result: QuizResult, customPrompts: string) => void;
  onClose: () => void;
  isGenerating?: boolean;
}

export function PersonalityQuiz({ onComplete, onClose, isGenerating }: PersonalityQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [customPrompts, setCustomPrompts] = useState("");
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResult = () => {
    const allTraits: string[] = [];
    const allInterests: string[] = [];
    
    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = quizQuestions.find(q => q.id === questionId);
      const option = question?.options.find(o => o.value === answerValue);
      if (option) {
        allTraits.push(...option.traits);
      }
    });

    // Determine Gen Z personality type based on traits
    let personality = "Balanced Bestie";
    let style = "modern";
    
    if (allTraits.includes("main-character") && allTraits.includes("social-butterfly")) {
      personality = "Main Character Energy";
      style = "vibrant";
    } else if (allTraits.includes("creative-genius") && allTraits.includes("artistic-soul")) {
      personality = "Creative Icon";
      style = "artistic";
    } else if (allTraits.includes("intellectual") && allTraits.includes("thought-leader")) {
      personality = "Big Brain Energy";
      style = "minimalist";
    } else if (allTraits.includes("nature-lover") && allTraits.includes("adventure-seeker")) {
      personality = "Touch Grass Champion";
      style = "dynamic";
    } else if (allTraits.includes("meme-lord") && allTraits.includes("chaotic-energy")) {
      personality = "Chaotic Good Bestie";
      style = "playful";
    } else if (allTraits.includes("empathetic") && allTraits.includes("soft-girl")) {
      personality = "Soft Girl Sage";
      style = "dreamy";
    }

    // Generate interests based on all answers
    Object.entries(answers).forEach(([questionId, answerValue]) => {
      // Map specific answers to interests
      if (answerValue === "tech_tok") allInterests.push("tech", "AI", "crypto", "future-trends");
      if (answerValue === "aesthetic_feeds") allInterests.push("fashion", "art", "music", "aesthetics");
      if (answerValue === "lifestyle_content") allInterests.push("travel", "food", "experiences", "photography");
      if (answerValue === "activism_content") allInterests.push("activism", "sustainability", "social-justice");
      
      if (answerValue === "creative_mode") allInterests.push("creating", "content-creation", "art");
      if (answerValue === "knowledge_seeker") allInterests.push("learning", "podcasts", "documentaries");
      if (answerValue === "touch_grass") allInterests.push("outdoors", "nature", "adventures");
      if (answerValue === "main_character") allInterests.push("events", "socializing", "making-memories");
      
      if (answerValue === "aesthetic") allInterests.push("photography", "design", "visual-arts");
      if (answerValue === "mindfulness") allInterests.push("meditation", "wellness", "self-care");
      if (answerValue === "gaming") allInterests.push("gaming", "esports", "streaming");
      if (answerValue === "music") allInterests.push("music", "concerts", "vinyl", "playlists");
      if (answerValue === "books") allInterests.push("reading", "literature", "book-clubs");
      if (answerValue === "fitness") allInterests.push("fitness", "sports", "health");
      if (answerValue === "food") allInterests.push("cooking", "restaurants", "food-culture");
      
      if (answerValue === "chaos") allInterests.push("memes", "comedy", "internet-culture");
      if (answerValue === "witty") allInterests.push("humor", "comedy", "wordplay");
      if (answerValue === "impact") allInterests.push("activism", "change-making", "leadership");
      if (answerValue === "creation") allInterests.push("art", "design", "creativity");
      if (answerValue === "connection") allInterests.push("relationships", "community", "networking");
      if (answerValue === "adventure") allInterests.push("travel", "exploration", "experiences");
    });
    
    const result: QuizResult = {
      personality,
      traits: [...new Set(allTraits)],
      interests: [...new Set(allInterests)],
      style
    };

    setQuizResult(result);
    setShowResult(true);
  };

  const generateProfile = () => {
    if (quizResult) {
      // Check rate limit before generating
      if (limitInfo && !limitInfo.canGenerate && !limitInfo.isChirpPlus) {
        // Redirect to subscription page for rate limited users
        setLocation('/subscribe');
        return;
      }
      onComplete(quizResult, customPrompts);
    }
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const currentQ = quizQuestions[currentQuestion];
  const currentAnswer = answers[currentQ?.id];

  if (showResult && quizResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <span>Your Profile Results</span>
          </CardTitle>
          <CardDescription>
            Ready to create an awesome AI profile based on your style
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-purple-600 mb-2">{quizResult.personality}</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your {quizResult.traits.slice(0, 3).join(", ")} personality is ready for an amazing profile makeover!
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Your Key Interests:</h4>
            <div className="flex flex-wrap gap-2">
              {quizResult.interests.slice(0, 6).map((interest, index) => (
                <span key={index} className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-sm">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="customPrompts" className="text-base font-semibold">
              Add Your Personal Touch (Optional)
            </Label>
            <Textarea
              id="customPrompts"
              placeholder="Tell us how to make this profile even more YOU... (e.g., 'Make my avatar Y2K aesthetic', 'Add some cute cats to my banner', 'Mention that I'm obsessed with matcha', 'Give me dark academia vibes')"
              value={customPrompts}
              onChange={(e) => setCustomPrompts(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowResult(false)}
              className="flex-1"
            >
              Retake Quiz
            </Button>
            <Button
              onClick={generateProfile}
              disabled={isGenerating}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? "Creating your profile..." : 
               limitInfo && !limitInfo.canGenerate && !limitInfo.isChirpPlus ? (
                 <div className="flex items-center space-x-2">
                   <Crown className="h-4 w-4" />
                   <span>Upgrade for Unlimited AI</span>
                 </div>
               ) : "Generate AI Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>Personality Quiz</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        <CardDescription>
          Let's find your digital personality and create something awesome
        </CardDescription>
        <Progress value={progress} className="mt-4" />
        <p className="text-sm text-gray-500 mt-2">
          Question {currentQuestion + 1} of {quizQuestions.length}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">{currentQ.question}</h3>
          <RadioGroup value={currentAnswer} onValueChange={(value) => handleAnswer(currentQ.id, value)}>
            {currentQ.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-900">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          <Button
            onClick={nextQuestion}
            disabled={!currentAnswer}
            className="flex items-center space-x-2"
          >
            <span>{currentQuestion === quizQuestions.length - 1 ? "Finish" : "Next"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


