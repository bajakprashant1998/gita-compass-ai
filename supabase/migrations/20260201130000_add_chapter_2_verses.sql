-- Chapter 2: Sankhya Yoga - First 10 Verses
-- Chapter ID: fixed UUID for consistency or generated via subquery

-- First, ensure Chapter 2 exists
INSERT INTO public.chapters (chapter_number, title_english, title_hindi, title_sanskrit, theme, description_english, description_hindi, verse_count)
VALUES (
  2, 
  'Contents of the Gita Summarized', 
  'सांख्य योग', 
  'सांख्ययोग', 
  'Transcendental Knowledge', 
  'Krishna begins his instruction to Arjuna, explaining the distinction between the temporary material body and the eternal spiritual soul. He encourages Arjuna to fight as a matter of duty.',
  'श्रीकृष्ण अर्जुन को शिक्षा देना प्रारंभ करते हैं और नश्वर शरीर तथा अमर आत्मा के भेद को समझाते हैं। वे अर्जुन को कर्तव्य के रूप में युद्ध करने के लिए प्रेरित करते हैं।',
  72
) ON CONFLICT (chapter_number) DO NOTHING;

-- Insert Verses 1-10 for Chapter 2
INSERT INTO public.shloks (chapter_id, verse_number, sanskrit_text, transliteration, hindi_meaning, english_meaning, life_application, practical_action, problem_context, solution_gita, modern_story) VALUES

-- Verse 1
((SELECT id FROM public.chapters WHERE chapter_number = 2), 1,
'सञ्जय उवाच |
तं तथा कृपयाविष्टमश्रुपूर्णाकुलेक्षणम् |
विषीदन्तमिदं वाक्यमुवाच मधुसूदनः ||',
'sañjaya uvāca
taṁ tathā kṛpayāviṣṭam aśru-pūrṇākulekṣaṇam
viṣīdantam idaṁ vākyam uvāca madhusūdanaḥ',
'संजय ने कहा: करुणा से व्याप्त, शोकयुक्त और आंसुओं से भरे नेत्रों वाले अर्जुन को देखकर मधुसूदन कृष्ण ने ये शब्द कहे।',
'Sanjaya said: Seeing Arjuna full of compassion, his mind depressed, his eyes full of tears, Madhusudana, Krishna, spoke the following words.',
'Emotional overwhelm can cloud our judgment just when we need clarity most. Acknowledging the state is the first step, but staying there renders us ineffective.',
'If you feel overwhelmed today, take a "cleansing breath" break. Acknowledge the emotion, but don''t let it dictate your next action. Step back to gain perspective.',
'You are paralyzed by empathy or sadness in a high-stakes situation.',
'The Gita acknowledges the physical reality of grief but prepares to transform it.',
'The CEO of a failing tech company sat in his office, staring at the list of employees he had to lay off. He was "full of compassion" and "eyes full of tears," paralyzed for three days. Nothing moved. Finally, his COO walked in (like Krishna) and said, "Your team needs you to lead, not just weep." Seeing his state was the turning point.'
),

-- Verse 2
((SELECT id FROM public.chapters WHERE chapter_number = 2), 2,
'श्रीभगवानुवाच |
कुतस्त्वा कश्मलमिदं विषमे समुपस्थितम् |
अनार्यजुष्टमस्वर्ग्यमकीर्तिकरमर्जुन ||',
'śrī-bhagavān uvāca
kutas tvā kaśmalam idaṁ viṣame samupasthitam
anārya-juṣṭam asvargyam akīrtikaram arjuna',
'श्री भगवान ने कहा: हे अर्जुन! इस विषम अवसर पर तुम्हें यह मोह कैसे प्राप्त हुआ? यह न तो श्रेष्ठ पुरुषों के आचरण के योग्य है, न ही स्वर्ग देने वाला है और न ही कीर्ति देने वाला है।',
'The Supreme Personality of Godhead said: My dear Arjuna, how have these impurities come upon you? They are not at all befitting a man who knows the value of life. They lead not to higher planets but to infamy.',
'In critical moments, weakness of heart is not a virtue but a hindrance. True nobility lies in facing challenges, not retreating from them under the guise of goodness.',
'Identify one area where you are hesitating to act because of fear masquerading as "being nice" or "caution." confront it directly today.',
'You are shrinking from a challenge and rationalizing it as "being a good person."',
'Krishna boldly challenges the narrative of weakness, calling it "un-Aryan" (ignoble).',
'A talented surgeon froze during a critical operation when unexpected bleeding started. He wanted to "stop and think" (hesitate). His mentor barked, "This hesitation is not you! It solves nothing and saves no one!" The sharp rebuke snapped him back to reality, and he finished the surgery successfully.'
),

-- Verse 3
((SELECT id FROM public.chapters WHERE chapter_number = 2), 3,
'क्लैब्यं मा स्म गमः पार्थ नैतत्त्वय्युपपद्यते |
क्षुद्रं हृदयदौर्बल्यं त्यक्त्वोत्तिष्ठ परन्तप ||',
'klaibyaṁ mā sma gamaḥ pārtha naitat tvayy upapadyate
kṣudraṁ hṛdaya-daurbalyaṁ tyaktvottiṣṭha parantapa',
'हे पार्थ! इस नपुंसकता को प्राप्त मत होओ। यह तुम्हें शोभा नहीं देती। हे शत्रुओं के दमनकर्ता! हृदय की इस तुच्छ दुर्बलता को त्यागकर युद्ध के लिए खड़े हो जाओ।',
'O son of Pritha, do not yield to this degrading impotence. It does not become you. Give up such petty weakness of heart and arise, O chastiser of the enemy.',
'We all have moments of "impotence" or "imposter syndrome" where we feel powerless. The instruction is to recognize this as temporary "weakness of heart" and stand up.',
'When you catch yourself saying "I can''t handle this," reframe it to "I am feeling weak right now, but I have the strength to stand up." Physically stand up and stretch.',
'You feel completely powerless and unable to cope with the situation.',
'Krishna labels the paralysis as "petty weakness of heart" and commands action.',
'Sarah, a junior architect, was presenting to a hostile zoning board. After their first brutal question, she felt small and wanted to retreat. She remembered her mentor''s voice: "Don''t yield to this smallness. Stand up." She straightened her posture, took a breath, and answered firmly. The "impotence" was just a feeling, not reality.'
),

-- Verse 4
((SELECT id FROM public.chapters WHERE chapter_number = 2), 4,
'अर्जुन उवाच |
कथं भीष्ममहं संख्ये द्रोणं च मधुसूदन |
इषुभिः प्रतियोत्स्यामि पूजार्हावरिसूदन ||',
'arjuna uvāca
kathaṁ bhīṣmam ahaṁ saṅkhye droṇaṁ ca madhusūdana
iṣubhiḥ pratiyotsyāmi pūjārhāv arisūdana',
'अर्जुन ने कहा: हे मधुसूदन! मैं युद्धभूमि में भीष्म और द्रोण जैसे पूजनीय गुरुजनों पर बाणों से वार कैसे करूंगा? हे अरिसूदन! वे तो पूजा के योग्य हैं।',
'Arjuna said: O killer of enemies, O Madhusudana, how can I counterattack with arrows in battle men like Bhishma and Drona, who are worthy of my worship?',
'Respect for authority or tradition can sometimes conflict with necessary duty. Distinguishing between person and principle is difficult but essential.',
'If you disagree with a mentor or boss, write down the specific issue separate from your respect for the person. Address the issue, not the person.',
'You are conflicted because your duty requires opposing someone you deeply respect.',
'Arjuna articulates the specific moral dilemma: duty vs. reverence.',
'Raj''s startup co-founder was his college professor, a man he revered. But the professor was making financial errors that would bankrupt the company. Raj struggled: "How can I fire the man who taught me everything?" He had to learn that protecting the company (duty) was separate from his personal respect (worship).'
),

-- Verse 5
((SELECT id FROM public.chapters WHERE chapter_number = 2), 5,
'गुरूनहत्वा हि महानुभावान्
श्रेयो भोक्तुं भैक्ष्यमपीह लोके |
हत्वार्थकामांस्तु गुरूनिहैव
भुञ्जीय भोगान्रुधिरप्रदिग्धान् ||',
'gurūn ahatvā hi mahānubhāvān
śreyo bhoktuṁ bhaikṣyam apīha loke
hatvārtha-kāmāṁs tu gurūn ihaiva
bhuñjīya bhogān rudhira-pradigdhān',
'महानुभाव गुरुजनों को न मारकर इस लोक में भिक्षा का अन्न खाना भी कल्याणकारक है। क्योंकि गुरुजनों को मारकर भी मैं इस लोक में रक्त से सने हुए अर्थ और काम रूप भोगों को ही तो भोगूंगा।',
'It would be better to live in this world by begging than to live at the cost of the lives of great souls who are my teachers. Even though desiring worldly gain, they are superiors. If they are killed, everything we enjoy will be tainted with blood.',
'Sometimes the "easier" path (begging/quitting) seems more noble than the "harder" path (fighting/succeeding) because we fear the cost of success.',
'Evaluate if your desire to "quit" or "live simply" is a genuine calling or just an escape from a difficult conflict.',
'You prefer to walk away and lose rather than win at a terrible cost.',
'Arjuna argues that success achieved through such violation would be "blood-stained" and joyless.',
'The whistle-blower at a pharmaceutical company knew that exposing the fraud would ruin the careers of his friends and mentors. "Better to just quit and find another job," he thought. "If I stay and fight, my career will be successful but stained with their destruction." He was wrestling with the "blood-stained feast" dilemma.'
),

-- Verse 6
((SELECT id FROM public.chapters WHERE chapter_number = 2), 6,
'न चैतद्विद्मः कतरन्नो गरीयो
यद्वा जयेम यदि वा नो जयेयुः |
यानेव हत्वा न जिजीविषाम
स्तेऽवस्थिताः प्रमुखे धार्तराष्ट्राः ||',
'na caitad vidmaḥ kataran no garīyo
yad vā jayema yadi vā no jayeyuḥ
yān eva hatvā na jijīviṣāmas
te ''vasthitāḥ pramukhe dhārtarāṣṭrāḥ',
'हम यह भी नहीं जानते कि हमारे लिए क्या श्रेष्ठ है - हम उन्हें जीतें या वे हमें जीतें। जिन्हें मारकर हम जीना भी नहीं चाहते, वे ही धृतराष्ट्र के पुत्र हमारे सामने खड़े हैं।',
'Nor do we know which is better - conquering them or being conquered by them. If we killed the sons of Dhritarashtra, we should not care to live. Yet they are now standing before us on the battlefield.',
'Analysis paralysis occurs when every outcome looks terrible. Recognizing that you "don''t know" is a pivotal moment of humility.',
'When you are stuck between two bad choices, stop trying to solve it with the same mind that created the problem. Admit "I don''t know" and seek external perspective.',
'You are confused because both winning and losing seem like bad options.',
'Arjuna reaches the peak of confusion, admitting his intellect cannot solve this.',
'Lisa, a product manager, had to choose: Launch a product with bugs (damaging trust) or delay the launch (missing the critical holiday window, damaging revenue). "I don''t know which is worse," she admitted to her team. "Winning feels like losing." This admission paved the way for a third option she hadn''t seen.'
),

-- Verse 7
((SELECT id FROM public.chapters WHERE chapter_number = 2), 7,
'कार्पण्यदोषोपहतस्वभावः
पृच्छामि त्वां धर्मसम्मूढचेताः |
यच्छ्रेयः स्यान्निश्चितं ब्रूहि तन्मे
शिष्यस्तेऽहं शाधि मां त्वां प्रपन्नम् ||',
'kārpaṇya-doṣopahata-svabhāvaḥ
pṛcchāmi tvāṁ dharma-sammūḍha-cetāḥ
yac chreyaḥ syān niścitaṁ brūhi tan me
śiṣyas te ''haṁ śādhi māṁ tvāṁ prapannam',
'कायरता रूपी दोष से मेरा स्वभाव दब गया है और धर्म के विषय में मेरा चित्त भ्रमित हो गया है। इसलिए मैं आपसे पूछता हूं कि जो निश्चित रूप से कल्याणकारक हो, वह मेरे लिए कहिए। मैं आपका शिष्य हूं, आपकी शरण में हूं, मुझे उपदेश दीजिए।',
'Now I am confused about my duty and have lost all composure because of miserly weakness. In this condition I am asking You to tell me for certain what is best for me. I am Your disciple, and a soul surrendered unto You. Please instruct me.',
'The moment of surrender is the moment of transformation. Admitting "I need help, tell me what to do" is not weakness, but the beginning of wisdom.',
'Identify a mentor or expert for your current biggest challenge. Say the words: "I am confused. Please tell me what you think is best."',
'You realize you cannot solve this problem alone and need guidance.',
'This is the turning point of the Gita - Arjuna shifts from friend to disciple.',
'For years, the founder tried to fix the company''s culture alone, failing repeatedly. Finally, he called an executive coach. "I''ve tried everything. I''m lost. I will do whatever you say." That surrender of ego allowed real change to begin. He became a "sisya" (disciple) instead of just a boss.'
),

-- Verse 8
((SELECT id FROM public.chapters WHERE chapter_number = 2), 8,
'न हि प्रपश्यामि ममापनुद्याद्
यच्छोकमुच्छोषणमिन्द्रियाणाम् |
अवाप्य भूमावसपत्नमृद्धं
राज्यं सुराणामपि चाधिपत्यम् ||',
'na hi prapaśyāmi mamāpanudyād
yac chokam ucchoṣaṇam indriyāṇām
avāpya bhūmāv asapatnam ṛddhaṁ
rājyaṁ surāṇām api cādhipatyam',
'मुझे ऐसा कोई उपाय नहीं दिखता जो मेरी इन्द्रियों को सुखाने वाले इस शोक को दूर कर सके। पृथ्वी पर निष्कंटक और धन-धान्य सम्पन्न राज्य और देवताओं का स्वामीपन प्राप्त करके भी मैं इस शोक से मुक्त नहीं हो सकूंगा।',
'I can find no means to drive away this grief which is drying up my senses. I will not be able to dispel it even if I win a prosperous, unrivaled kingdom on earth with sovereignty like the demigods in heaven.',
'Material success cannot cure spiritual or existential emptiness. Realizing the limits of external achievement is crucial for seeking internal solutions.',
'Don''t expect a promotion, a purchase, or a vacation to fix deep internal dissatisfaction. Distinguish between external problems and internal grief.',
'You realize that even getting everything you want won''t make you happy.',
'Arjuna anticipates that even the greatest external victory won''t heal his internal anguish.',
'After winning the Oscar, the actor returned to his hotel room and felt a crushing emptiness. "I have the highest award in my field," he realized, "and it didn''t fix the hole inside me." He understood then that his grief required a different kind of medicine than success.'
),

-- Verse 9
((SELECT id FROM public.chapters WHERE chapter_number = 2), 9,
'सञ्जय उवाच |
एवमुक्त्वा हृषीकेशं गुडाकेशः परन्तप |
न योत्स्य इति गोविन्दमुक्त्वा तूष्णीं बभूव ह ||',
'sañjaya uvāca
evam uktvā hṛṣīkeśaṁ guḍākeśaḥ parantapa
na yotsya iti govindam uktvā tūṣṇīṁ babhūva ha',
'संजय ने कहा: हे राजन! निद्रा को जीतने वाले अर्जुन ने अंतर्यामी श्रीकृष्ण से कहा - "गोविन्द! मैं युद्ध नहीं करूंगा" और यह कहकर वे चुप हो गए।',
'Sanjaya said: Having spoken thus, Arjuna, chastiser of enemies, told Krishna, "Govinda, I shall not fight," and fell silent.',
'There is power in stating your boundary clearly, even if it comes from despair. "I will not fight" conveys the finality of the burnout.',
'If you are truly done, say it clearly. "I cannot continue this project as is." Silence after a clear statement forces a shift in the dynamic.',
'You have reached the absolute end of your ability to function.',
'Arjuna''s refusal is total. He stops arguing and simply refuses to act.',
'The project manager had been working 80-hour weeks for months. During the sprint planning, she finally put her pen down. "I cannot do another weekend," she said. And then she sat silent. Her silence was louder than her arguments. It forced the management to finally address the resource issue.'
),

-- Verse 10
((SELECT id FROM public.chapters WHERE chapter_number = 2), 10,
'तमुवाच हृषीकेशः प्रहसन्निव भारत |
सेनयोरुभयोर्मध्ये विषीदन्तमिदं वचः ||',
'tam uvāca hṛṣīkeśaḥ prahasann iva bhārata
senayor ubhayor madhye viṣīdantam idaṁ vacaḥ',
'हे भरतवंशी! दोनों सेनाओं के बीच उस शोक-संतप्त अर्जुन से श्रीकृष्ण ने मानो हंसते हुए यह वचन कहे।',
'O descendant of Bharata, at that time Krishna, smiling, in the midst of both the armies, spoke the following words to the grief-stricken Arjuna.',
'A wise mentor approaches high-stakes drama with a "smile" - a sense of perspective and lightness. Taking problems seriously doesn''t mean losing your sense of humor or peace.',
'When you are guiding someone in crisis, bring a calm, slightly light-hearted energy. It breaks the tension. Don''t drown in their drama.',
'You need to bring lightness to a heavy situation to help someone else.',
'Krishna''s smile ("prahasann") contrasts sharply with Arjuna''s grief, signaling that the problem is solvable.',
'The team was panic-stricken because the server crashed an hour before launch. The CTO walked in, saw their terrified faces, and smiled. "Well," he said, "at least we found it now and not tomorrow." His smile broke the paralysis, and the team got to work fixing it.'
)

ON CONFLICT (chapter_id, verse_number) DO UPDATE SET
  sanskrit_text = EXCLUDED.sanskrit_text,
  transliteration = EXCLUDED.transliteration,
  hindi_meaning = EXCLUDED.hindi_meaning,
  english_meaning = EXCLUDED.english_meaning,
  life_application = EXCLUDED.life_application,
  practical_action = EXCLUDED.practical_action,
  problem_context = EXCLUDED.problem_context,
  solution_gita = EXCLUDED.solution_gita,
  modern_story = EXCLUDED.modern_story;

-- Link Chapter 2 verses to Problems (Sample mapping)
INSERT INTO public.shlok_problems (shlok_id, problem_id, relevance_score)
SELECT s.id, p.id, 
  CASE 
    WHEN s.verse_number IN (1, 2, 3) THEN 
       CASE p.slug 
         WHEN 'self-doubt' THEN 10 
         WHEN 'fear' THEN 9 
         ELSE 5 
       END
    WHEN s.verse_number IN (4, 5, 6) THEN 
       CASE p.slug 
         WHEN 'confusion' THEN 10 
         WHEN 'decision-making' THEN 9 
         ELSE 5 
       END
    WHEN s.verse_number IN (7, 8) THEN 
       CASE p.slug 
         WHEN 'confusion' THEN 10 
         WHEN 'anxiety' THEN 9 
         ELSE 5 
       END
    ELSE 5
  END
FROM public.shloks s
CROSS JOIN public.problems p
WHERE s.chapter_id = (SELECT id FROM public.chapters WHERE chapter_number = 2)
  AND s.verse_number <= 10
  AND p.slug IN ('self-doubt', 'fear', 'confusion', 'decision-making', 'anxiety')
ON CONFLICT DO NOTHING;

-- Update Chapter 2 verse count (initially 10 for now)
UPDATE public.chapters SET verse_count = 10 WHERE chapter_number = 2;
