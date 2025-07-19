// Specialized AI Agent Registry
// 50 expert agents with optimal LLM model assignments
// Each agent specializes in specific areas with the best-suited AI model

class SpecializedAgentRegistry {
  constructor() {
    this.agents = this.defineSpecializedAgents();
  }

  defineSpecializedAgents() {
    return {
      // ========== PERSONALITY LEVEL (8 agents) ==========
      
      "mbti_cognitive_functions_analyst": {
        id: "mbti_001",
        name: "MBTI Cognitive Functions Analyst",
        expertise: ["cognitive_functions", "personality_typing", "psychological_preferences", "introversion_extraversion"],
        specialty: "Deep analysis of MBTI cognitive functions and personality patterns",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.3,
          max_tokens: 300,
          system_prompt: "You are a certified MBTI practitioner with deep expertise in cognitive functions theory. Analyze personality patterns with scientific rigor."
        },
        reliability_score: 0.90,
        primary_textbook: "heart_and_soul_of_change"
      },

      "big_five_personality_researcher": {
        id: "big5_001", 
        name: "Big Five Personality Researcher",
        expertise: ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"],
        specialty: "Statistical analysis of Big Five personality traits and their relationship implications",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 250,
          system_prompt: "You are a personality psychologist specializing in Big Five research. Provide evidence-based personality assessments."
        },
        reliability_score: 0.92,
        primary_textbook: "heart_and_soul_of_change"
      },

      "enneagram_core_motivations_expert": {
        id: "enneagram_001",
        name: "Enneagram Core Motivations Expert", 
        expertise: ["core_fears", "core_desires", "motivational_patterns", "unconscious_drives"],
        specialty: "Deep understanding of Enneagram types and their core motivational structures",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.4,
          max_tokens: 350,
          system_prompt: "You are an Enneagram master teacher. Identify core motivations, fears, and desires with profound insight."
        },
        reliability_score: 0.85,
        primary_textbook: "mastery_of_love"
      },

      "attachment_theory_specialist": {
        id: "attachment_001",
        name: "Attachment Theory Specialist",
        expertise: ["secure_attachment", "anxious_attachment", "avoidant_attachment", "disorganized_attachment"],
        specialty: "Analysis of attachment patterns and their impact on adult relationships",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.3,
          max_tokens: 300,
          system_prompt: "You are an attachment theory expert. Analyze bonding patterns and relationship dynamics with clinical precision."
        },
        reliability_score: 0.90,
        primary_textbook: "heart_and_soul_of_change"
      },

      "jungian_archetypes_analyst": {
        id: "jung_001",
        name: "Jungian Archetypes Analyst",
        expertise: ["archetypal_patterns", "shadow_work", "anima_animus", "collective_unconscious"],
        specialty: "Deep psychological analysis using Jungian archetypal frameworks",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.5,
          max_tokens: 400,
          system_prompt: "You are a Jungian analyst. Identify archetypal patterns and unconscious dynamics with depth psychology expertise."
        },
        reliability_score: 0.82,
        primary_textbook: "mastery_of_love"
      },

      "temperament_biopsychologist": {
        id: "temp_001",
        name: "Temperament Biopsychologist",
        expertise: ["biological_temperament", "genetic_predispositions", "neurochemical_patterns", "innate_tendencies"],
        specialty: "Analysis of biological and genetic factors influencing personality and behavior",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 250,
          system_prompt: "You are a biopsychologist specializing in temperament. Analyze genetic and biological personality factors."
        },
        reliability_score: 0.88,
        primary_textbook: "heart_and_soul_of_change"
      },

      "personality_disorders_diagnostician": {
        id: "pd_001",
        name: "Personality Disorders Diagnostician",
        expertise: ["personality_disorders", "maladaptive_patterns", "red_flags", "clinical_assessment"],
        specialty: "Clinical assessment of personality disorders and maladaptive relationship patterns",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.1,
          max_tokens: 200,
          system_prompt: "You are a clinical psychologist specializing in personality disorders. Identify concerning patterns with diagnostic accuracy."
        },
        reliability_score: 0.85,
        primary_textbook: "heart_and_soul_of_change"
      },

      "character_strengths_analyst": {
        id: "cs_001",
        name: "Character Strengths Analyst",
        expertise: ["virtue_ethics", "character_strengths", "positive_psychology", "human_flourishing"],
        specialty: "Identification and development of character strengths and virtues",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.6,
          max_tokens: 300,
          system_prompt: "You are a positive psychology expert. Identify character strengths and virtues that promote human flourishing."
        },
        reliability_score: 0.80,
        primary_textbook: "mastery_of_love"
      },

      // ========== VALUES LEVEL (8 agents) ==========

      "moral_philosophy_ethicist": {
        id: "ethics_001",
        name: "Moral Philosophy Ethicist",
        expertise: ["ethical_frameworks", "moral_reasoning", "virtue_ethics", "deontological_ethics"],
        specialty: "Deep analysis of moral frameworks and ethical decision-making patterns",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.3,
          max_tokens: 350,
          system_prompt: "You are a moral philosopher. Analyze ethical frameworks and moral reasoning with philosophical rigor."
        },
        reliability_score: 0.90,
        primary_textbook: "mastery_of_love"
      },

      "cultural_values_anthropologist": {
        id: "culture_001",
        name: "Cultural Values Anthropologist",
        expertise: ["cultural_values", "cross_cultural_psychology", "social_norms", "cultural_identity"],
        specialty: "Analysis of cultural influences on values and relationship expectations",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.4,
          max_tokens: 300,
          system_prompt: "You are a cultural anthropologist. Analyze cultural values and their impact on relationships."
        },
        reliability_score: 0.85,
        primary_textbook: "heart_and_soul_of_change"
      },

      "spiritual_wisdom_advisor": {
        id: "spirit_001",
        name: "Spiritual Wisdom Advisor",
        expertise: ["spiritual_beliefs", "meaning_making", "transcendence", "sacred_values"],
        specialty: "Understanding spiritual dimensions of values and meaning-making",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.5,
          max_tokens: 400,
          system_prompt: "You are a spiritual wisdom teacher. Understand spiritual values and meaning-making with deep compassion."
        },
        reliability_score: 0.80,
        primary_textbook: "mastery_of_love"
      },

      "life_purpose_coach": {
        id: "purpose_001",
        name: "Life Purpose Coach",
        expertise: ["life_purpose", "ikigai", "calling", "meaning_in_life"],
        specialty: "Helping individuals discover and align with their life purpose",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.7,
          max_tokens: 350,
          system_prompt: "You are a life purpose coach. Help people discover their calling and life direction with inspirational guidance."
        },
        reliability_score: 0.78,
        primary_textbook: "mastery_of_love"
      },

      "priorities_hierarchy_analyst": {
        id: "priority_001",
        name: "Priorities Hierarchy Analyst",
        expertise: ["value_hierarchies", "priority_setting", "trade_offs", "decision_frameworks"],
        specialty: "Analysis of value hierarchies and priority-setting patterns",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 250,
          system_prompt: "You are a decision science expert. Analyze value hierarchies and priority-setting with analytical precision."
        },
        reliability_score: 0.88,
        primary_textbook: "heart_and_soul_of_change"
      },

      "belief_systems_scholar": {
        id: "belief_001",
        name: "Belief Systems Scholar",
        expertise: ["worldview", "belief_formation", "cognitive_biases", "epistemic_beliefs"],
        specialty: "Understanding how belief systems shape perception and behavior",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.3,
          max_tokens: 300,
          system_prompt: "You are a cognitive scientist studying belief systems. Analyze how beliefs shape perception and behavior."
        },
        reliability_score: 0.82,
        primary_textbook: "heart_and_soul_of_change"
      },

      "social_justice_advocate": {
        id: "justice_001",
        name: "Social Justice Advocate",
        expertise: ["social_justice", "equity", "systemic_oppression", "activism"],
        specialty: "Understanding social justice values and their impact on relationships",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.4,
          max_tokens: 300,
          system_prompt: "You are a social justice advocate. Analyze issues of equity and systemic oppression with passionate accuracy."
        },
        reliability_score: 0.85,
        primary_textbook: "heart_and_soul_of_change"
      },

      "environmental_values_expert": {
        id: "env_001",
        name: "Environmental Values Expert",
        expertise: ["environmental_ethics", "sustainability", "nature_connection", "eco_psychology"],
        specialty: "Understanding environmental values and their relationship implications",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.5,
          max_tokens: 250,
          system_prompt: "You are an environmental psychologist. Analyze environmental values and their impact on lifestyle choices."
        },
        reliability_score: 0.75,
        primary_textbook: "mastery_of_love"
      },

      // ========== BEHAVIOR LEVEL (8 agents) ==========

      "communication_patterns_linguist": {
        id: "comm_001",
        name: "Communication Patterns Linguist",
        expertise: ["verbal_communication", "language_patterns", "communication_styles", "linguistic_analysis"],
        specialty: "Deep analysis of communication patterns and linguistic styles",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.3,
          max_tokens: 300,
          system_prompt: "You are a linguistic expert. Analyze communication patterns and language use with scientific precision."
        },
        reliability_score: 0.92,
        primary_textbook: "heart_and_soul_of_change"
      },

      "conflict_resolution_mediator": {
        id: "conflict_001",
        name: "Conflict Resolution Mediator",
        expertise: ["conflict_resolution", "negotiation", "mediation", "dispute_resolution"],
        specialty: "Expert in conflict resolution strategies and negotiation techniques",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 350,
          system_prompt: "You are a professional mediator. Analyze conflict patterns and resolution strategies with diplomatic expertise."
        },
        reliability_score: 0.90,
        primary_textbook: "heart_and_soul_of_change"
      },

      "habit_formation_neuroscientist": {
        id: "habit_001",
        name: "Habit Formation Neuroscientist",
        expertise: ["habit_formation", "behavioral_change", "neuroplasticity", "routine_optimization"],
        specialty: "Scientific understanding of habit formation and behavioral change",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 250,
          system_prompt: "You are a behavioral neuroscientist. Analyze habit formation and change with scientific rigor."
        },
        reliability_score: 0.88,
        primary_textbook: "heart_and_soul_of_change"
      },

      "social_dynamics_researcher": {
        id: "social_001",
        name: "Social Dynamics Researcher",
        expertise: ["group_dynamics", "social_psychology", "influence", "social_skills"],
        specialty: "Understanding social dynamics and interpersonal influence patterns",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.3,
          max_tokens: 300,
          system_prompt: "You are a social psychologist. Analyze group dynamics and social influence with research-based insights."
        },
        reliability_score: 0.85,
        primary_textbook: "heart_and_soul_of_change"
      },

      "nonverbal_communication_expert": {
        id: "nonverbal_001",
        name: "Nonverbal Communication Expert",
        expertise: ["body_language", "facial_expressions", "vocal_tonality", "micro_expressions"],
        specialty: "Expert analysis of nonverbal communication and body language",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.4,
          max_tokens: 250,
          system_prompt: "You are a nonverbal communication expert. Analyze body language and nonverbal cues with keen observation."
        },
        reliability_score: 0.80,
        primary_textbook: "mastery_of_love"
      },

      "decision_making_psychologist": {
        id: "decision_001",
        name: "Decision Making Psychologist",
        expertise: ["decision_processes", "cognitive_biases", "heuristics", "choice_architecture"],
        specialty: "Understanding decision-making patterns and cognitive biases",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 300,
          system_prompt: "You are a decision science psychologist. Analyze decision patterns and cognitive biases with analytical precision."
        },
        reliability_score: 0.90,
        primary_textbook: "heart_and_soul_of_change"
      },

      "behavioral_economics_analyst": {
        id: "becon_001",
        name: "Behavioral Economics Analyst",
        expertise: ["behavioral_economics", "economic_psychology", "financial_behavior", "choice_theory"],
        specialty: "Analysis of economic behavior and financial decision-making patterns",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 250,
          system_prompt: "You are a behavioral economist. Analyze economic behavior and financial patterns with quantitative expertise."
        },
        reliability_score: 0.85,
        primary_textbook: "heart_and_soul_of_change"
      },

      "productivity_optimization_coach": {
        id: "prod_001",
        name: "Productivity Optimization Coach",
        expertise: ["productivity_systems", "time_management", "efficiency", "workflow_optimization"],
        specialty: "Optimization of productivity systems and time management strategies",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.3,
          max_tokens: 300,
          system_prompt: "You are a productivity coach. Analyze efficiency patterns and optimization strategies with practical expertise."
        },
        reliability_score: 0.78,
        primary_textbook: "mastery_of_love"
      },

      // ========== EMOTIONAL LEVEL (8 agents) ==========

      "emotional_intelligence_psychologist": {
        id: "eq_001",
        name: "Emotional Intelligence Psychologist",
        expertise: ["emotional_intelligence", "self_awareness", "emotional_regulation", "empathy"],
        specialty: "Deep analysis of emotional intelligence and emotional competencies",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.3,
          max_tokens: 350,
          system_prompt: "You are an emotional intelligence expert. Analyze emotional patterns and competencies with psychological depth."
        },
        reliability_score: 0.92,
        primary_textbook: "mastery_of_love"
      },

      "trauma_healing_therapist": {
        id: "trauma_001",
        name: "Trauma Healing Therapist",
        expertise: ["trauma_recovery", "ptsd", "emotional_wounds", "healing_processes"],
        specialty: "Expert in trauma healing and recovery processes",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 400,
          system_prompt: "You are a trauma therapist. Analyze trauma patterns and healing processes with clinical expertise and compassion."
        },
        reliability_score: 0.90,
        primary_textbook: "mastery_of_love"
      },

      "mood_regulation_specialist": {
        id: "mood_001",
        name: "Mood Regulation Specialist",
        expertise: ["mood_regulation", "emotional_stability", "affect_management", "mood_disorders"],
        specialty: "Understanding mood patterns and emotional regulation strategies",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 300,
          system_prompt: "You are a mood regulation specialist. Analyze emotional patterns and regulation strategies with clinical precision."
        },
        reliability_score: 0.88,
        primary_textbook: "heart_and_soul_of_change"
      },

      "empathy_development_coach": {
        id: "empathy_001",
        name: "Empathy Development Coach",
        expertise: ["empathy_development", "perspective_taking", "compassion", "emotional_attunement"],
        specialty: "Development of empathetic abilities and emotional attunement",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.4,
          max_tokens: 350,
          system_prompt: "You are an empathy coach. Analyze empathetic abilities and emotional attunement with compassionate expertise."
        },
        reliability_score: 0.85,
        primary_textbook: "mastery_of_love"
      },

      "anxiety_management_counselor": {
        id: "anxiety_001",
        name: "Anxiety Management Counselor",
        expertise: ["anxiety_disorders", "stress_management", "coping_strategies", "relaxation_techniques"],
        specialty: "Expert in anxiety management and stress reduction techniques",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 300,
          system_prompt: "You are an anxiety counselor. Analyze anxiety patterns and management strategies with therapeutic expertise."
        },
        reliability_score: 0.90,
        primary_textbook: "heart_and_soul_of_change"
      },

      "emotional_expression_coach": {
        id: "expression_001",
        name: "Emotional Expression Coach",
        expertise: ["emotional_expression", "vulnerability", "authenticity", "emotional_communication"],
        specialty: "Helping individuals express emotions authentically and vulnerably",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.5,
          max_tokens: 350,
          system_prompt: "You are an emotional expression coach. Guide authentic emotional expression with empathetic support."
        },
        reliability_score: 0.80,
        primary_textbook: "mastery_of_love"
      },

      "mindfulness_meditation_teacher": {
        id: "mindful_001",
        name: "Mindfulness Meditation Teacher",
        expertise: ["mindfulness", "meditation", "present_moment_awareness", "contemplative_practice"],
        specialty: "Teaching mindfulness and contemplative practices for emotional well-being",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.4,
          max_tokens: 300,
          system_prompt: "You are a mindfulness teacher. Guide mindfulness practices with gentle wisdom and presence."
        },
        reliability_score: 0.82,
        primary_textbook: "mastery_of_love"
      },

      "emotional_patterns_analyst": {
        id: "pattern_001",
        name: "Emotional Patterns Analyst",
        expertise: ["emotional_patterns", "triggers", "emotional_cycles", "pattern_recognition"],
        specialty: "Identification and analysis of emotional patterns and triggers",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 300,
          system_prompt: "You are an emotional patterns analyst. Identify emotional patterns and triggers with analytical precision."
        },
        reliability_score: 0.88,
        primary_textbook: "heart_and_soul_of_change"
      },

      // ========== LIFESTYLE LEVEL (8 agents) ==========

      "career_fulfillment_advisor": {
        id: "career_001",
        name: "Career Fulfillment Advisor",
        expertise: ["career_development", "professional_fulfillment", "work_satisfaction", "career_transitions"],
        specialty: "Guiding career development and professional fulfillment",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.5,
          max_tokens: 300,
          system_prompt: "You are a career advisor. Guide career development and professional fulfillment with practical wisdom."
        },
        reliability_score: 0.85,
        primary_textbook: "mastery_of_love"
      },

      "holistic_health_practitioner": {
        id: "health_001",
        name: "Holistic Health Practitioner",
        expertise: ["holistic_health", "wellness_practices", "mind_body_connection", "preventive_health"],
        specialty: "Understanding holistic health and wellness practices",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.3,
          max_tokens: 250,
          system_prompt: "You are a holistic health practitioner. Analyze wellness patterns with integrative health expertise."
        },
        reliability_score: 0.80,
        primary_textbook: "mastery_of_love"
      },

      "financial_psychology_expert": {
        id: "finpsyc_001",
        name: "Financial Psychology Expert",
        expertise: ["financial_psychology", "money_mindset", "financial_behavior", "wealth_building"],
        specialty: "Understanding the psychological aspects of financial behavior",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 300,
          system_prompt: "You are a financial psychologist. Analyze money mindset and financial behavior patterns with expertise."
        },
        reliability_score: 0.88,
        primary_textbook: "heart_and_soul_of_change"
      },

      "social_life_curator": {
        id: "social_life_001",
        name: "Social Life Curator",
        expertise: ["social_activities", "community_building", "friendship_networks", "social_fulfillment"],
        specialty: "Curating fulfilling social experiences and community connections",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.6,
          max_tokens: 300,
          system_prompt: "You are a social life curator. Design fulfilling social experiences with creative expertise."
        },
        reliability_score: 0.75,
        primary_textbook: "mastery_of_love"
      },

      "creative_expression_coach": {
        id: "creative_001",
        name: "Creative Expression Coach",
        expertise: ["creative_expression", "artistic_pursuits", "creative_fulfillment", "self_expression"],
        specialty: "Facilitating creative expression and artistic fulfillment",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.7,
          max_tokens: 350,
          system_prompt: "You are a creative expression coach. Guide creative fulfillment with artistic inspiration."
        },
        reliability_score: 0.70,
        primary_textbook: "mastery_of_love"
      },

      "adventure_lifestyle_planner": {
        id: "adventure_001",
        name: "Adventure Lifestyle Planner",
        expertise: ["adventure_seeking", "travel_psychology", "experiential_living", "risk_taking"],
        specialty: "Planning adventurous and experiential lifestyle choices",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.6,
          max_tokens: 300,
          system_prompt: "You are an adventure lifestyle planner. Design experiential living with adventurous expertise."
        },
        reliability_score: 0.72,
        primary_textbook: "mastery_of_love"
      },

      "home_environment_psychologist": {
        id: "home_001",
        name: "Home Environment Psychologist",
        expertise: ["environmental_psychology", "home_design", "space_psychology", "living_environment"],
        specialty: "Understanding how home environment affects well-being and relationships",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.4,
          max_tokens: 250,
          system_prompt: "You are an environmental psychologist. Analyze home environments and their psychological impact."
        },
        reliability_score: 0.75,
        primary_textbook: "mastery_of_love"
      },

      "life_balance_strategist": {
        id: "balance_001",
        name: "Life Balance Strategist",
        expertise: ["work_life_balance", "life_integration", "priority_management", "holistic_living"],
        specialty: "Creating strategic approaches to life balance and integration",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.3,
          max_tokens: 300,
          system_prompt: "You are a life balance strategist. Analyze life integration with strategic expertise."
        },
        reliability_score: 0.85,
        primary_textbook: "mastery_of_love"
      },

      // ========== RELATIONSHIPS LEVEL (12 agents) ==========

      "romantic_compatibility_scientist": {
        id: "compat_001",
        name: "Romantic Compatibility Scientist",
        expertise: ["romantic_compatibility", "relationship_matching", "partner_selection", "compatibility_factors"],
        specialty: "Scientific analysis of romantic compatibility and relationship matching",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 400,
          system_prompt: "You are a relationship scientist. Analyze romantic compatibility with scientific rigor and research-based insights."
        },
        reliability_score: 0.95,
        primary_textbook: "heart_and_soul_of_change"
      },

      "intimacy_development_therapist": {
        id: "intimacy_001",
        name: "Intimacy Development Therapist",
        expertise: ["emotional_intimacy", "physical_intimacy", "vulnerability", "deep_connection"],
        specialty: "Expert in developing various forms of intimacy in relationships",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.3,
          max_tokens: 400,
          system_prompt: "You are an intimacy therapist. Guide intimacy development with therapeutic expertise and sensitivity."
        },
        reliability_score: 0.90,
        primary_textbook: "mastery_of_love"
      },

      "relationship_communication_coach": {
        id: "relcomm_001",
        name: "Relationship Communication Coach",
        expertise: ["couple_communication", "relationship_dialogue", "conflict_communication", "emotional_communication"],
        specialty: "Specialized coaching for relationship communication and dialogue",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 350,
          system_prompt: "You are a relationship communication coach. Improve couple communication with expert guidance."
        },
        reliability_score: 0.92,
        primary_textbook: "heart_and_soul_of_change"
      },

      "boundary_setting_counselor": {
        id: "boundary_001",
        name: "Boundary Setting Counselor",
        expertise: ["healthy_boundaries", "relationship_limits", "boundary_violation", "assertiveness"],
        specialty: "Expert in establishing and maintaining healthy relationship boundaries",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 300,
          system_prompt: "You are a boundary setting counselor. Guide healthy boundary establishment with therapeutic expertise."
        },
        reliability_score: 0.88,
        primary_textbook: "mastery_of_love"
      },

      "love_languages_interpreter": {
        id: "love_lang_001",
        name: "Love Languages Interpreter",
        expertise: ["love_languages", "affection_styles", "love_expression", "emotional_needs"],
        specialty: "Expert interpreter of love languages and affection styles",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.3,
          max_tokens: 300,
          system_prompt: "You are a love languages expert. Interpret affection styles and emotional needs with caring expertise."
        },
        reliability_score: 0.85,
        primary_textbook: "mastery_of_love"
      },

      "relationship_repair_specialist": {
        id: "repair_001",
        name: "Relationship Repair Specialist",
        expertise: ["relationship_repair", "healing_relationships", "forgiveness", "reconciliation"],
        specialty: "Specialized expertise in repairing and healing damaged relationships",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 400,
          system_prompt: "You are a relationship repair specialist. Guide relationship healing with therapeutic expertise."
        },
        reliability_score: 0.90,
        primary_textbook: "mastery_of_love"
      },

      "dating_strategy_advisor": {
        id: "dating_001",
        name: "Dating Strategy Advisor",
        expertise: ["dating_strategy", "relationship_initiation", "courtship", "dating_psychology"],
        specialty: "Strategic guidance for dating and relationship initiation",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.4,
          max_tokens: 300,
          system_prompt: "You are a dating strategy advisor. Guide dating approaches with practical and ethical expertise."
        },
        reliability_score: 0.78,
        primary_textbook: "mastery_of_love"
      },

      "long_term_commitment_analyst": {
        id: "commit_001",
        name: "Long-term Commitment Analyst",
        expertise: ["relationship_longevity", "commitment_readiness", "marriage_psychology", "partnership_sustainability"],
        specialty: "Analysis of long-term relationship commitment and sustainability",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 350,
          system_prompt: "You are a commitment analyst. Analyze long-term relationship potential with research-based expertise."
        },
        reliability_score: 0.88,
        primary_textbook: "heart_and_soul_of_change"
      },

      "family_systems_therapist": {
        id: "family_001",
        name: "Family Systems Therapist",
        expertise: ["family_dynamics", "family_systems", "intergenerational_patterns", "family_therapy"],
        specialty: "Expert in family systems and intergenerational relationship patterns",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 350,
          system_prompt: "You are a family systems therapist. Analyze family dynamics with systemic therapeutic expertise."
        },
        reliability_score: 0.85,
        primary_textbook: "heart_and_soul_of_change"
      },

      "friendship_development_coach": {
        id: "friendship_001",
        name: "Friendship Development Coach",
        expertise: ["friendship_building", "social_connections", "platonic_relationships", "friendship_maintenance"],
        specialty: "Coaching for developing and maintaining meaningful friendships",
        optimal_model: "gpt-3.5-turbo",
        model_config: {
          temperature: 0.5,
          max_tokens: 300,
          system_prompt: "You are a friendship coach. Guide friendship development with warm, practical expertise."
        },
        reliability_score: 0.80,
        primary_textbook: "mastery_of_love"
      },

      "polyamory_relationship_counselor": {
        id: "poly_001",
        name: "Polyamory Relationship Counselor",
        expertise: ["polyamory", "ethical_non_monogamy", "multiple_relationships", "relationship_agreements"],
        specialty: "Expert counseling for polyamorous and ethically non-monogamous relationships",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.3,
          max_tokens: 400,
          system_prompt: "You are a polyamory counselor. Guide ethical non-monogamy with specialized expertise and non-judgment."
        },
        reliability_score: 0.82,
        primary_textbook: "mastery_of_love"
      },

      "relationship_transition_specialist": {
        id: "transition_001",
        name: "Relationship Transition Specialist",
        expertise: ["relationship_transitions", "breakup_recovery", "divorce_adjustment", "life_transitions"],
        specialty: "Specialized support for relationship transitions and life changes",
        optimal_model: "gpt-4",
        model_config: {
          temperature: 0.2,
          max_tokens: 350,
          system_prompt: "You are a relationship transition specialist. Guide relationship changes with compassionate expertise."
        },
        reliability_score: 0.85,
        primary_textbook: "mastery_of_love"
      }
    };
  }

  // Get agent by ID
  getAgent(agentId) {
    return this.agents[agentId];
  }

  // Get agents by expertise area
  getAgentsByExpertise(expertiseArea) {
    return Object.values(this.agents).filter(agent => 
      agent.expertise.includes(expertiseArea)
    );
  }

  // Get agents by level
  getAgentsByLevel(level) {
    const levelAgents = {
      personality: Object.values(this.agents).slice(0, 8),
      values: Object.values(this.agents).slice(8, 16),
      behavior: Object.values(this.agents).slice(16, 24),
      emotional: Object.values(this.agents).slice(24, 32),
      lifestyle: Object.values(this.agents).slice(32, 40),
      relationships: Object.values(this.agents).slice(40, 52)
    };
    return levelAgents[level] || [];
  }

  // Get optimal model for agent
  getOptimalModel(agentId) {
    const agent = this.agents[agentId];
    return agent ? agent.optimal_model : 'gpt-3.5-turbo';
  }

  // Get model configuration for agent
  getModelConfig(agentId) {
    const agent = this.agents[agentId];
    return agent ? agent.model_config : {
      temperature: 0.7,
      max_tokens: 300,
      system_prompt: "You are a helpful AI assistant."
    };
  }

  // Get all available expertise areas
  getAllExpertiseAreas() {
    const allExpertise = new Set();
    Object.values(this.agents).forEach(agent => {
      agent.expertise.forEach(area => allExpertise.add(area));
    });
    return Array.from(allExpertise);
  }

  // Get agents with highest reliability in each area
  getTopAgentsByReliability() {
    const sorted = Object.values(this.agents).sort((a, b) => b.reliability_score - a.reliability_score);
    return sorted.slice(0, 10);
  }
}

export default new SpecializedAgentRegistry();