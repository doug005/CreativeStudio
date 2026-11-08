import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import { connectDatabase } from '../config/db.js';
import User from '../models/User.js';
import Content from '../models/Content.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Viewer from '../models/Viewer.js';

const examples = [
  { title: 'The Creative Reset: Make Space for Better Ideas', description: 'A practical guide to stepping away from the noise and finding a more intentional rhythm for your creative work.', category: 'Creativity', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=85', articleBody: 'Good ideas need a little room. Start with a short walk, a small notebook, and one question you genuinely want to explore. Give yourself permission to make a rough first version before worrying about whether it is perfect.' },
  { title: 'A Calmer Way to Learn New Technology', description: 'Small, repeatable learning habits that make complex tools feel a little less intimidating.', category: 'Technology', type: 'Video', thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://www.youtube.com/watch?v=aircAruvnKk' },
  { title: 'Notes from a Slow Morning', description: 'A short audio reflection on routines, attention, and giving the day a thoughtful beginning.', category: 'Lifestyle', type: 'Podcast', thumbnailUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3' },
  { title: 'Learning in Public, One Project at a Time', description: 'Why sharing your learning process can help you build useful connections and stay curious.', category: 'Education', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=85', articleBody: 'Learning in public does not require having all the answers. Share what you tried, what surprised you, and what you want to understand next. A small project can become a useful conversation.' },
  { title: 'Everyday Frames: Finding Stories in Familiar Places', description: 'A visual study of the quiet details we often walk past.', category: 'Entertainment', type: 'Image', thumbnailUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=90' },
  { title: 'A Small Guide to Better Digital Habits', description: 'Gentle ways to make technology work for your attention instead of competing with it.', category: 'Technology', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85', articleBody: 'Start by noticing which digital tools leave you feeling focused and which leave you scattered. Turn off the alerts that do not need an immediate answer, move distracting apps away from your home screen, and make one quiet space for the work that matters. Small adjustments are easier to keep than a complete reset.' },
  { title: 'What Happens Inside a Neural Network?', description: 'A visual introduction to the layers of patterns that help computers learn from examples.', category: 'Technology', type: 'Video', thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://www.youtube.com/watch?v=aircAruvnKk' },
  { title: 'The Useful Art of Making a First Draft', description: 'Why a rough beginning is often the fastest path toward a thoughtful final idea.', category: 'Creativity', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=85', articleBody: 'A first draft is not a verdict on your ability. It is a place to put the pieces where you can see them. Write quickly, sketch loosely, or record a voice note without correcting every sentence. Once the idea exists outside your head, you can decide what deserves attention next.' },
  { title: 'A Field Recording of Rain on the Window', description: 'A quiet sound study for slowing down between one project and the next.', category: 'Lifestyle', type: 'Podcast', thumbnailUrl: 'https://images.unsplash.com/photo-1501691223387-dd0500403074?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3' },
  { title: 'Five Questions That Make Reading Active', description: 'Simple prompts for connecting what you read to the questions you already carry.', category: 'Education', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=85', articleBody: 'Before you begin, ask what you hope to understand. While reading, mark one idea that changes your perspective and one that raises a new question. Afterward, explain the central point in your own words, connect it to something you have seen, and choose one small thing you want to explore further.' },
  { title: 'The Soundtrack to an Unhurried Afternoon', description: 'An easy listening session for making, wandering, or letting your thoughts settle.', category: 'Entertainment', type: 'Podcast', thumbnailUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3' },
  { title: 'How to Choose a Note-Taking System', description: 'A practical comparison of paper notes, digital notes, and the simplest system that lasts.', category: 'Technology', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=85', articleBody: 'The best note-taking system is the one you will return to. Paper is flexible and distraction-free; digital notes are searchable and easy to rearrange. Try capturing ideas in one place for a week, then review them at a regular time. Keep the structure light until you know what you actually need to find again.' },
  { title: 'Colour Studies from the Neighbourhood', description: 'A photo essay about finding unexpected palettes in familiar streets and shopfronts.', category: 'Creativity', type: 'Image', thumbnailUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=90' },
  { title: 'A Better Way to Practise a Difficult Skill', description: 'Break learning into focused sessions, useful feedback, and room to recover.', category: 'Education', type: 'Video', thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://www.youtube.com/watch?v=8d9K6s0b5x8' },
  { title: 'Little Rituals for a Clearer Morning', description: 'A flexible start to the day built around attention, light, and one achievable priority.', category: 'Lifestyle', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85', articleBody: 'A calm morning does not have to begin before sunrise. Open a window, drink some water, and give yourself a few minutes before opening messages. Write down one thing that would make the day feel meaningful. Leave enough flexibility for real life, and let the ritual serve you rather than become another task to complete.' },
  { title: 'The Stories Hidden in Ordinary Objects', description: 'A short documentary-style reflection on the memories we attach to everyday things.', category: 'Entertainment', type: 'Video', thumbnailUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U' },
  { title: 'The Friendly Checklist for a New Project', description: 'Turn a big, hazy ambition into a first step you can actually take this week.', category: 'Creativity', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=85', articleBody: 'Write down what you want the project to do, who it is for, and what a very small version could look like. List what you already have, what you need to learn, and one person who could offer useful feedback. Pick a first action that takes less than an hour. Momentum often follows a clear beginning.' },
  { title: 'Understanding the Web: From Browser to Server', description: 'Follow a page request across the network and see how the pieces fit together.', category: 'Technology', type: 'Video', thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://www.youtube.com/watch?v=edGoDe9p1yc' },
  { title: 'A Pocket Lesson in Visual Composition', description: 'Use balance, contrast, and a little negative space to guide a viewer’s eye.', category: 'Education', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=85', articleBody: 'Composition is a way of deciding what deserves attention. Give the main subject room to breathe, use contrast to separate important shapes, and look for lines that carry the eye through the frame. Before adding detail, remove anything that distracts from the central idea. A clear composition can feel generous and intentional.' },
  { title: 'The Studio Playlist: Focus Without Rush', description: 'An instrumental audio set for patient work and long stretches of making.', category: 'Entertainment', type: 'Podcast', thumbnailUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3' },
  { title: 'A Walk Without a Destination', description: 'What changes when you let a familiar route become a small invitation to notice.', category: 'Lifestyle', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=85', articleBody: 'Choose a route you know and walk it at a pace that lets you look around. Notice the temperature, the shape of the light, and one detail you have never paid attention to. You do not need to turn the walk into a productivity exercise. Sometimes a little unstructured time is enough to return with a fresh perspective.' },
  { title: 'Building a Tiny Tool for a Daily Friction', description: 'A maker’s walkthrough of turning one repetitive task into a small, useful program.', category: 'Technology', type: 'Video', thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw' },
  { title: 'Learning Through the Questions You Ask', description: 'Use curiosity as a map when a topic feels too broad to approach.', category: 'Education', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=85', articleBody: 'When a subject feels enormous, write down the questions that make you lean closer. Sort them into what you can answer now, what needs a source, and what may become a longer exploration. Follow one thread at a time. Questions give your learning direction, and they make progress easier to recognise.' },
  { title: 'The Shape of a Good Creative Constraint', description: 'A short talk on how limited time or materials can help an idea find its character.', category: 'Creativity', type: 'Video', thumbnailUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://www.youtube.com/watch?v=YQHsXMglC9A' },
  { title: 'A Slow Evening, Recorded in Sound', description: 'A brief audio postcard made from kitchen sounds, rain, and the end of the day.', category: 'Lifestyle', type: 'Podcast', thumbnailUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3' },
  { title: 'Scenes from a Window Seat', description: 'A small visual journal of changing landscapes and the pleasure of looking carefully.', category: 'Entertainment', type: 'Image', thumbnailUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=90' },
  { title: 'A No-Stress Introduction to Version Control', description: 'Learn how snapshots and branches make it easier to experiment with code.', category: 'Technology', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?auto=format&fit=crop&w=1200&q=85', articleBody: 'Version control keeps a history of changes so you can understand how a project evolved and return to an earlier state when needed. Make small commits with clear messages, and use a branch when you want to explore an idea without disturbing the main version. The goal is not ceremony; it is a safer space to try things.' },
  { title: 'How to Read a Research Paper with Confidence', description: 'A guided approach to abstracts, evidence, and the questions behind a study.', category: 'Education', type: 'Video', thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://www.youtube.com/watch?v=MH2l9vl8o4o' },
  { title: 'Making Peace with the Unfinished', description: 'A reflection on creative work that teaches you something before it is complete.', category: 'Creativity', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=85', articleBody: 'Not every unfinished project is a failure or a promise to continue. Some ideas have already done their work by showing you what you enjoy, what you need to learn, or what you no longer want to make. Keep a note about what the project taught you. Then choose deliberately: return to it, reshape it, or let it rest.' },
  { title: 'A Gentle Stretch Break for Desk Days', description: 'A short guided reset for shoulders, hands, and posture between focused sessions.', category: 'Lifestyle', type: 'Video', thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM' },
  { title: 'The Details Behind a Memorable Scene', description: 'A close look at pacing, sound, and visual choices in a favourite kind of story.', category: 'Entertainment', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=85', articleBody: 'A memorable scene often works through several quiet choices at once. The framing gives us a point of view, the pacing decides how long we stay, and sound can suggest a feeling before a character names it. Try watching a short sequence twice: first for the story, then for the craft. The second viewing can make familiar moments feel newly made.' },
  { title: 'A Practical Introduction to Accessible Design', description: 'Small interface decisions that make digital experiences clearer for more people.', category: 'Technology', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=85', articleBody: 'Accessible design starts with clear structure, readable contrast, and controls that work by keyboard as well as pointer. Give images meaningful alternative text when they carry information, label form fields, and make focus states visible. Test with real people and assistive settings. A more usable interface benefits everyone.' },
  { title: 'The Art of Explaining Something Simply', description: 'A teaching exercise for turning a complicated idea into a clear, memorable explanation.', category: 'Education', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=85', articleBody: 'Choose one idea and explain it without relying on specialist language. Start with what the learner already knows, introduce one new concept, then use an example that makes the relationship visible. Ask what remains unclear. Simplicity is not leaving out important detail; it is arranging the detail so someone can follow.' },
  { title: 'Found Objects, New Combinations', description: 'A visual experiment in arranging ordinary materials into unexpected little compositions.', category: 'Creativity', type: 'Image', thumbnailUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1800&q=90' },
  { title: 'A Better Relationship with Your To-Do List', description: 'Separate what matters today from everything you could possibly do someday.', category: 'Lifestyle', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=85', articleBody: 'A useful list helps you decide, not just remember. Keep a short set of priorities for today and move larger ideas to a separate place. Break vague tasks into actions you can begin, and leave room for the unexpected. At the end of the day, notice what changed instead of treating the list as a measure of your worth.' },
  { title: 'Why We Keep Returning to Stories', description: 'A thoughtful audio conversation about shared imagination, memory, and meaning.', category: 'Entertainment', type: 'Podcast', thumbnailUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3' },
  { title: 'Small Experiments with Generative Art', description: 'Explore how simple rules and playful variation can lead to surprising visual work.', category: 'Technology', type: 'Image', thumbnailUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1800&q=90' },
  { title: 'Keep a Notebook for Things You Notice', description: 'Collect questions, images, phrases, and observations without needing to use them right away.', category: 'Creativity', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=85', articleBody: 'A notebook can be a place for collecting rather than performing. Write down a phrase you overhear, a question you cannot answer, or a detail that caught your eye. Do not worry about organising every note immediately. Over time, these fragments can form unexpected connections and offer a starting point for new work.' },
  { title: 'The Science of a Restful Night', description: 'A grounded overview of light, routine, and the habits that support better sleep.', category: 'Lifestyle', type: 'Video', thumbnailUrl: 'https://images.unsplash.com/photo-1511295742362-92c96b1c6b8f?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://www.youtube.com/watch?v=nm1TxQj9IsQ' },
  { title: 'Learning to Look at Art Slowly', description: 'Spend five minutes with one image and notice how your interpretation changes.', category: 'Education', type: 'Image', thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1800&q=90' },
  { title: 'A Short History of the Moving Image', description: 'Trace a few creative milestones that shaped the way we tell stories on screen.', category: 'Entertainment', type: 'Video', thumbnailUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4' },
  { title: 'Build a Tiny Website, One Page at a Time', description: 'A beginner-friendly project plan for making a personal corner of the web.', category: 'Technology', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=85', articleBody: 'Begin with one page and one purpose. Write the content first, then add a clear heading, a few useful links, and a layout that works on a small screen. Keep your first version simple enough to finish. You can learn from a real page much faster than from an endless collection of plans.' },
  { title: 'A Creative Practice You Can Actually Keep', description: 'Make a little room for regular practice without turning it into another source of pressure.', category: 'Creativity', type: 'Podcast', thumbnailUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=85', mediaUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3' },
  { title: 'Make a Personal Learning Map', description: 'Connect what you know, what you want to know, and the next small experiment.', category: 'Education', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=85', articleBody: 'Put your main question in the centre of a page. Around it, note what you already understand, what you are curious about, and where you might find reliable answers. Draw connections between related ideas. Choose one branch to explore this week, then update the map as your understanding grows.' },
  { title: 'The Basotho Blanket: A Story Woven in Colour', description: 'A closer look at the patterns, daily use, and cultural meaning carried in a familiar highland textile.', category: 'Creativity', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=85', articleBody: 'A blanket can be warmth, identity, and a visible part of a shared story. Its colours and patterns travel through everyday life, ceremonies, and changing generations. Looking closely at a textile means noticing not only its design, but also the hands, memories, and meanings gathered around it. Cultural objects ask us to listen as carefully as we look.' },
  { title: 'Learning a Place by Listening First', description: 'Thoughts on asking better questions, following local knowledge, and arriving with humility.', category: 'Education', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85', articleBody: 'A place is more than a view. Before deciding what a landscape means, make room for the people who know it through daily life, memory, and work. Listen to different perspectives, ask permission before recording or sharing, and be open to revising your first impression. Attention is a good beginning for learning responsibly.' },
  { title: 'Small Habits for Making Space to Think', description: 'A few low-pressure ways to protect quiet time and give ideas a chance to take shape.', category: 'Lifestyle', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85', articleBody: 'Thinking time rarely appears by accident. Put a short pause between activities, leave a notebook within reach, and choose one moment in the day when you can step away from notifications. Keep the practice forgiving: ten quiet minutes count, and some days will look different. The goal is to create an opening, not another rule.' },
  { title: 'When Technology Meets Everyday Creativity', description: 'How digital tools can support making without replacing the curiosity and judgement behind it.', category: 'Technology', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85', articleBody: 'A tool can help us explore variations, organise material, or share work with people far away. The creative choices still come from deciding what matters, what feels honest, and what deserves another pass. Use technology with intention: understand its limits, respect the people represented in its data, and keep human judgement in the process.' },
  { title: 'Why a Good Story Leaves Room for the Listener', description: 'An appreciation of pauses, open questions, and the details that invite us to bring our own meaning.', category: 'Entertainment', type: 'Article', thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=85', articleBody: 'Some stories explain everything; others trust us to notice what remains unsaid. A pause, a repeated image, or a small change in a character can give the audience room to think and feel. That openness is not a lack of care. It can be an invitation to participate, carrying the story a little further in our own minds.' },
];

const exampleComments = [
  { title: 'The Basotho Blanket: A Story Woven in Colour', displayName: 'Mpho Thabane', message: 'I appreciate how this connects the patterns to the stories and people behind them. It made me look at a familiar blanket differently.', status: 'Approved' },
  { title: 'The Basotho Blanket: A Story Woven in Colour', displayName: 'Lerato Mokoena', message: 'A thoughtful reminder that everyday objects can carry so much history and identity.', status: 'Approved' },
  { title: 'Learning a Place by Listening First', displayName: 'Thabo Mofokeng', message: 'Listening before documenting is such an important point. I would love to hear more local perspectives on this.', status: 'Approved' },
  { title: 'Learning a Place by Listening First', displayName: 'Palesa Ntloko', message: 'This is a helpful perspective for anyone who wants to learn about a place respectfully.', status: 'Pending' },
  { title: 'Small Habits for Making Space to Think', displayName: 'Neo Rantšo', message: 'The idea of making an opening instead of adding another rule really resonated with me.', status: 'Approved' },
  { title: 'Small Habits for Making Space to Think', displayName: 'Teboho Khumalo', message: 'A gentle and practical approach. I am going to try the short pause between tasks.', status: 'Pending' },
  { title: 'When Technology Meets Everyday Creativity', displayName: 'Refiloe Mokete', message: 'I like the emphasis on keeping human judgement in the process while still exploring new tools.', status: 'Approved' },
  { title: 'Why a Good Story Leaves Room for the Listener', displayName: 'Kabelo Sechele', message: 'The best stories do stay with me because they leave space to think about them afterwards.', status: 'Approved' },
];

const communityCreators = [
  { name: 'Mpho Thabane', email: 'mpho.thabane@community.creativestudio.local' },
  { name: 'Lerato Mokoena', email: 'lerato.mokoena@community.creativestudio.local' },
  { name: 'Thabo Mofokeng', email: 'thabo.mofokeng@community.creativestudio.local' },
  { name: 'Palesa Ntloko', email: 'palesa.ntloko@community.creativestudio.local' },
  { name: 'Neo Rantso', email: 'neo.rantso@community.creativestudio.local' },
  { name: 'Teboho Khumalo', email: 'teboho.khumalo@community.creativestudio.local' },
  { name: 'Refiloe Mokete', email: 'refiloe.mokete@community.creativestudio.local' },
  { name: 'Kabelo Sechele', email: 'kabelo.sechele@community.creativestudio.local' },
];

const katisoTitles = new Set([
  'The Creative Reset: Make Space for Better Ideas',
  'The Basotho Blanket: A Story Woven in Colour',
  'Learning a Place by Listening First',
  'Small Habits for Making Space to Think',
  'When Technology Meets Everyday Creativity',
]);

const likeNames = ['Avery', 'Jordan', 'Morgan', 'Taylor', 'Casey', 'Riley', 'Sam', 'Jamie', 'Robin', 'Sky'];

try {
  await connectDatabase();
  const email = (process.env.SEED_CREATOR_EMAIL || 'creator@creatorspace.local').trim().toLowerCase();
  const password = process.env.SEED_CREATOR_PASSWORD || 'ChangeMe123!';
  if (password.length < 12) throw new Error('SEED_CREATOR_PASSWORD must be at least 12 characters.');
  let creator = await User.findOne({ email });
  if (creator) {
    creator.name = 'Katiso Douglas';
    creator.bio = 'Katiso Douglas is a curious creator sharing thoughtful stories, ideas, and the process behind the work.';
    await creator.save();
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    creator = await User.create({ email, name: 'Katiso Douglas', bio: 'Katiso Douglas is a curious creator sharing thoughtful stories, ideas, and the process behind the work.', passwordHash });
  }
  const creatorIds = [];
  for (const profile of communityCreators) {
    let communityCreator = await User.findOne({ email: profile.email });
    if (!communityCreator) {
      const passwordHash = await bcrypt.hash(randomBytes(48).toString('base64url'), 12);
      communityCreator = await User.create({ ...profile, passwordHash, bio: `${profile.name} shares ideas, useful discoveries, and work in progress.` });
    }
    creatorIds.push(communityCreator._id);
  }

  const now = Date.now();
  const existingByTitle = new Map((await Content.find({ title: { $in: examples.map((item) => item.title) } }).select('title').lean()).map((item) => [item.title, true]));
  const missing = examples.filter((item) => !existingByTitle.has(item.title));
  if (missing.length) {
    await Content.insertMany(missing.map((item) => {
      const index = examples.indexOf(item);
      const owner = katisoTitles.has(item.title) ? creator._id : creatorIds[index % creatorIds.length];
      return { ...item, creator: owner, status: 'Published', publicationDate: new Date(now - index * 86400000 * 3), views: [1248, 986, 754, 631, 423][index] || Math.max(35, 520 - index * 9) };
    }));
  }

  const pieces = await Content.find({ title: { $in: examples.map((item) => item.title) } }).select('_id title creator').lean();
  const byTitle = new Map(pieces.map((piece) => [piece.title, piece]));
  const ownershipUpdates = examples.flatMap((item, index) => {
    const piece = byTitle.get(item.title);
    if (!piece) return [];
    const targetCreator = katisoTitles.has(item.title) ? creator._id : creatorIds[index % creatorIds.length];
    return String(piece.creator) === String(targetCreator) ? [] : [{ updateOne: { filter: { _id: piece._id }, update: { $set: { creator: targetCreator } } } }];
  });
  if (ownershipUpdates.length) await Content.bulkWrite(ownershipUpdates);

  const orderedPieces = examples.map((item) => byTitle.get(item.title)).filter(Boolean);
  const viewerOperations = [];
  const likeOperations = [];
  for (const piece of orderedPieces) {
    const count = 3 + createHash('sha256').update(piece.title).digest()[0] % 15;
    for (let index = 0; index < count; index += 1) {
      const viewerKey = `demo-like-${piece._id}-${index.toString().padStart(2, '0')}`;
      viewerOperations.push({ updateOne: { filter: { viewerKey }, update: { $setOnInsert: { viewerKey, displayName: likeNames[index % likeNames.length] } }, upsert: true } });
      likeOperations.push({ updateOne: { filter: { content: piece._id, viewerKey }, update: { $setOnInsert: { content: piece._id, viewerKey } }, upsert: true } });
    }
  }
  if (viewerOperations.length) await Viewer.bulkWrite(viewerOperations, { ordered: false });
  const likeResult = likeOperations.length ? await Like.bulkWrite(likeOperations, { ordered: false }) : { upsertedCount: 0 };
  const addedLikes = likeResult.upsertedCount || 0;

  let addedComments = 0;
  for (const example of exampleComments) {
    const content = await Content.findOne({ title: example.title }).select('_id');
    if (!content) continue;
    const exists = await Comment.exists({ content: content._id, displayName: example.displayName, message: example.message });
    if (!exists) {
      await Comment.create({ content: content._id, displayName: example.displayName, message: example.message, status: example.status });
      addedComments += 1;
    }
  }
  console.log(`Seed complete for ${email}: added ${missing.length} pieces, ${addedComments} comments, and ${addedLikes} likes; Katiso owns ${await Content.countDocuments({ creator: creator._id })} pieces; total catalogue ${await Content.countDocuments()}.`);
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
