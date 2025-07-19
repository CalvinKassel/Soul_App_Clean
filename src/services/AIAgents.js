// AI Agent Base Classes and Implementations
// Executive agents and worker agents for the 6-level hierarchy

import KnowledgeBaseService from './KnowledgeBaseService';

// BASE CLASSES
class ExecutiveAgent {
  constructor(level) {
    this.level = level;
    this.knowledgeBase = KnowledgeBaseService;
  }

  async synthesize(workerInsights, consensusWeights) {
    // Base synthesis method - to be overridden by specific executives
    return {
      key_pattern: "General pattern identified",
      recommendation: "General recommendation",
      confidence: 0.7,
      question_to_ask: "What would you like to explore further?"
    };
  }
}

class WorkerAgent {
  constructor(expertise, reliability = 0.8) {
    this.expertise = expertise;
    this.reliability = reliability;
    this.knowledgeBase = KnowledgeBaseService;
  }

  async analyze(topic, userMessage, userProfile) {
    // Base analysis method - to be overridden by specific workers
    return {
      insight: "General insight",
      confidence: this.reliability,
      evidence: "Based on general patterns",
      recommendation: "General recommendation"
    };
  }

  // Access textbook knowledge relevant to this agent's expertise
  getRelevantKnowledge(query) {
    return this.knowledgeBase.getSmartRecommendations(query);
  }
}

// EXECUTIVE AGENTS
class PersonalityExecutive extends ExecutiveAgent {
  constructor() {
    super('personality');
  }

  async synthesize(workerInsights, consensusWeights) {
    const mbtiInsight = workerInsights.mbti_analyst;
    const bigFiveInsight = workerInsights.big_five_researcher;
    const attachmentInsight = workerInsights.attachment_theorist;
    
    // Synthesize personality insights with weighted consensus
    const personalityType = this.determinePersonalityType(mbtiInsight, bigFiveInsight);
    const attachmentStyle = attachmentInsight?.insight || "Need more information";
    
    return {
      key_pattern: `Primary personality pattern: ${personalityType}. Attachment style: ${attachmentStyle}`,
      recommendation: `Focus on ${this.getPersonalityRecommendation(personalityType)}`,
      confidence: this.calculateWeightedConfidence(workerInsights, consensusWeights),
      question_to_ask: "What situations make you feel most like yourself?"
    };
  }

  determinePersonalityType(mbtiInsight, bigFiveInsight) {
    // Combine MBTI and Big Five insights
    if (mbtiInsight && bigFiveInsight) {
      return `${mbtiInsight.insight} with ${bigFiveInsight.insight} tendencies`;
    }
    return mbtiInsight?.insight || bigFiveInsight?.insight || "Still analyzing";
  }

  getPersonalityRecommendation(personalityType) {
    // Provide personalized recommendations based on personality
    if (personalityType.includes('introvert')) {
      return "quality one-on-one connections and authentic conversations";
    } else if (personalityType.includes('extravert')) {
      return "social activities and meeting new people in group settings";
    }
    return "understanding your natural energy patterns";
  }

  calculateWeightedConfidence(insights, weights) {
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const [workerName, insight] of Object.entries(insights)) {
      if (insight && weights[workerName]) {
        const weight = weights[workerName].reliability;
        totalWeight += weight;
        weightedSum += weight * insight.confidence;
      }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }
}

class ValuesExecutive extends ExecutiveAgent {
  constructor() {
    super('values');
  }

  async synthesize(workerInsights, consensusWeights) {
    const moralInsight = workerInsights.moral_philosopher;
    const spiritualInsight = workerInsights.spiritual_advisor;
    const purposeInsight = workerInsights.life_purpose_coach;
    
    const coreValues = this.identifyCoreValues(moralInsight, spiritualInsight, purposeInsight);
    
    return {
      key_pattern: `Core values: ${coreValues}`,
      recommendation: `Seek partners who share your ${coreValues} values`,
      confidence: this.calculateWeightedConfidence(workerInsights, consensusWeights),
      question_to_ask: "What would you never compromise on in a relationship?"
    };
  }

  identifyCoreValues(moralInsight, spiritualInsight, purposeInsight) {
    const values = [];
    if (moralInsight?.insight) values.push(moralInsight.insight);
    if (spiritualInsight?.insight) values.push(spiritualInsight.insight);
    if (purposeInsight?.insight) values.push(purposeInsight.insight);
    return values.join(', ') || "Still identifying";
  }

  calculateWeightedConfidence(insights, weights) {
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const [workerName, insight] of Object.entries(insights)) {
      if (insight && weights[workerName]) {
        const weight = weights[workerName].reliability;
        totalWeight += weight;
        weightedSum += weight * insight.confidence;
      }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }
}

class RelationshipsExecutive extends ExecutiveAgent {
  constructor() {
    super('relationships');
  }

  async synthesize(workerInsights, consensusWeights) {
    const compatibilityInsight = workerInsights.romantic_compatibility_analyst;
    const communicationInsight = workerInsights.relationship_communication_coach;
    const intimacyInsight = workerInsights.intimacy_building_expert;
    
    const relationshipPattern = this.identifyRelationshipPattern(compatibilityInsight, communicationInsight, intimacyInsight);
    
    return {
      key_pattern: `Relationship pattern: ${relationshipPattern}`,
      recommendation: `Focus on ${this.getRelationshipRecommendation(relationshipPattern)}`,
      confidence: this.calculateWeightedConfidence(workerInsights, consensusWeights),
      question_to_ask: "What does feeling truly connected to someone look like for you?"
    };
  }

  identifyRelationshipPattern(compatibilityInsight, communicationInsight, intimacyInsight) {
    // Analyze relationship patterns from different perspectives
    if (compatibilityInsight && communicationInsight) {
      return `${compatibilityInsight.insight} with ${communicationInsight.insight} communication style`;
    }
    return compatibilityInsight?.insight || communicationInsight?.insight || "Still analyzing";
  }

  getRelationshipRecommendation(pattern) {
    if (pattern.includes('direct communication')) {
      return "clear, honest communication and partners who appreciate directness";
    } else if (pattern.includes('emotional connection')) {
      return "building emotional intimacy and finding emotionally available partners";
    }
    return "understanding your relationship needs better";
  }

  calculateWeightedConfidence(insights, weights) {
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const [workerName, insight] of Object.entries(insights)) {
      if (insight && weights[workerName]) {
        const weight = weights[workerName].reliability;
        totalWeight += weight;
        weightedSum += weight * insight.confidence;
      }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }
}

// WORKER AGENTS - Key Specialists
class MBTIAnalyst extends WorkerAgent {
  constructor() {
    super(['mbti', 'personality_types', 'cognitive_functions'], 0.85);
  }

  async analyze(topic, userMessage, userProfile) {
    const msg = userMessage.toLowerCase();
    
    // Analyze for MBTI indicators
    let mbtiType = "Need more information";
    let confidence = 0.4;
    
    if (msg.includes('people') || msg.includes('social') || msg.includes('party')) {
      if (msg.includes('love') || msg.includes('energy') || msg.includes('exciting')) {
        mbtiType = "Extraverted tendencies";
        confidence = 0.6;
      } else if (msg.includes('drain') || msg.includes('tired') || msg.includes('overwhelming')) {
        mbtiType = "Introverted tendencies";
        confidence = 0.6;
      }
    }
    
    if (msg.includes('feeling') || msg.includes('emotion') || msg.includes('heart')) {
      mbtiType += " with Feeling preference";
      confidence += 0.2;
    } else if (msg.includes('logic') || msg.includes('think') || msg.includes('analyze')) {
      mbtiType += " with Thinking preference";
      confidence += 0.2;
    }
    
    return {
      insight: mbtiType,
      confidence: Math.min(confidence, 1.0),
      evidence: `Based on language patterns in: "${userMessage.substring(0, 50)}..."`,
      recommendation: `Explore ${mbtiType.includes('Extraverted') ? 'social' : 'intimate'} dating approaches`
    };
  }
}

class RomanticCompatibilityAnalyst extends WorkerAgent {
  constructor() {
    super(['romantic_compatibility', 'relationship_matching', 'partnership_potential'], 0.90);
  }

  async analyze(topic, userMessage, userProfile) {
    const msg = userMessage.toLowerCase();
    
    // Analyze for compatibility factors
    let compatibilityStyle = "Analyzing compatibility needs";
    let confidence = 0.5;
    
    if (msg.includes('similar') || msg.includes('same') || msg.includes('like me')) {
      compatibilityStyle = "Seeks similarity-based compatibility";
      confidence = 0.7;
    } else if (msg.includes('different') || msg.includes('complement') || msg.includes('balance')) {
      compatibilityStyle = "Seeks complementary compatibility";
      confidence = 0.7;
    }
    
    if (msg.includes('deep') || msg.includes('meaningful') || msg.includes('connection')) {
      compatibilityStyle += " with focus on emotional depth";
      confidence += 0.1;
    }
    
    // Get knowledge from textbooks
    const knowledge = this.getRelevantKnowledge(msg);
    
    return {
      insight: compatibilityStyle,
      confidence: Math.min(confidence, 1.0),
      evidence: `Based on compatibility language patterns and ${knowledge.primary_textbook} insights`,
      recommendation: `Focus on ${compatibilityStyle.includes('similarity') ? 'shared values and interests' : 'complementary strengths'}`
    };
  }
}

class EmotionalIntelligenceCoach extends WorkerAgent {
  constructor() {
    super(['emotional_intelligence', 'self_awareness', 'empathy'], 0.90);
  }

  async analyze(topic, userMessage, userProfile) {
    const msg = userMessage.toLowerCase();
    
    // Analyze emotional intelligence indicators
    let eqLevel = "Developing emotional awareness";
    let confidence = 0.6;
    
    if (msg.includes('feel') || msg.includes('emotion') || msg.includes('sense')) {
      eqLevel = "Shows emotional awareness";
      confidence = 0.7;
    }
    
    if (msg.includes('others') || msg.includes('people feel') || msg.includes('understand')) {
      eqLevel = "Shows empathetic awareness";
      confidence = 0.8;
    }
    
    if (msg.includes('react') || msg.includes('response') || msg.includes('handle')) {
      eqLevel += " with emotional regulation skills";
      confidence += 0.1;
    }
    
    // Get relevant knowledge from textbooks
    const knowledge = this.getRelevantKnowledge('emotional intelligence');
    
    return {
      insight: eqLevel,
      confidence: Math.min(confidence, 1.0),
      evidence: `Based on emotional language patterns and ${knowledge.primary_textbook} principles`,
      recommendation: `Continue developing ${eqLevel.includes('empathetic') ? 'empathetic connection' : 'emotional self-awareness'}`
    };
  }
}

class TraumaHealingSpecialist extends WorkerAgent {
  constructor() {
    super(['trauma_healing', 'emotional_wounds', 'past_relationships'], 0.85);
  }

  async analyze(topic, userMessage, userProfile) {
    const msg = userMessage.toLowerCase();
    
    // Analyze for trauma/healing indicators
    let healingStatus = "Healthy emotional processing";
    let confidence = 0.6;
    
    if (msg.includes('hurt') || msg.includes('pain') || msg.includes('wound')) {
      healingStatus = "Processing emotional wounds";
      confidence = 0.7;
    }
    
    if (msg.includes('past') || msg.includes('before') || msg.includes('ex')) {
      healingStatus = "Working through past relationship patterns";
      confidence = 0.8;
    }
    
    if (msg.includes('heal') || msg.includes('better') || msg.includes('grow')) {
      healingStatus = "Actively healing and growing";
      confidence = 0.8;
    }
    
    // Get Miguel Ruiz wisdom on emotional healing
    const knowledge = this.getRelevantKnowledge('emotional wounds healing');
    
    return {
      insight: healingStatus,
      confidence: Math.min(confidence, 1.0),
      evidence: `Based on healing language patterns and Mastery of Love principles`,
      recommendation: `Focus on ${healingStatus.includes('wounds') ? 'self-compassion and healing' : 'continued emotional growth'}`
    };
  }
}

// Export all classes
export {
  AIAgentHierarchy,
  ExecutiveAgent,
  WorkerAgent,
  PersonalityExecutive,
  ValuesExecutive,
  RelationshipsExecutive,
  MBTIAnalyst,
  RomanticCompatibilityAnalyst,
  EmotionalIntelligenceCoach,
  TraumaHealingSpecialist
};

// Placeholder classes for remaining agents
class BehaviorExecutive extends ExecutiveAgent {
  constructor() { super('behavior'); }
}

class EmotionalExecutive extends ExecutiveAgent {
  constructor() { super('emotional'); }
}

class LifestyleExecutive extends ExecutiveAgent {
  constructor() { super('lifestyle'); }
}

// Additional worker agents (simplified for now)
class BigFiveResearcher extends WorkerAgent {
  constructor() { super(['big_five', 'openness', 'conscientiousness'], 0.90); }
}

class EnneagramSpecialist extends WorkerAgent {
  constructor() { super(['enneagram', 'core_motivations'], 0.80); }
}

class AttachmentTheorist extends WorkerAgent {
  constructor() { super(['attachment_styles', 'bonding_patterns'], 0.88); }
}

class TemperamentExpert extends WorkerAgent {
  constructor() { super(['temperament', 'natural_tendencies'], 0.75); }
}

class PersonalityDisordersSpecialist extends WorkerAgent {
  constructor() { super(['personality_disorders', 'red_flags'], 0.85); }
}

class MoralPhilosopher extends WorkerAgent {
  constructor() { super(['ethics', 'moral_reasoning'], 0.85); }
}

class CulturalAnthropologist extends WorkerAgent {
  constructor() { super(['cultural_values', 'social_norms'], 0.80); }
}

class SpiritualAdvisor extends WorkerAgent {
  constructor() { super(['spiritual_beliefs', 'meaning_making'], 0.75); }
}

class EthicsSpecialist extends WorkerAgent {
  constructor() { super(['ethical_frameworks', 'moral_dilemmas'], 0.88); }
}

class LifePurposeCoach extends WorkerAgent {
  constructor() { super(['life_purpose', 'purpose_clarity'], 0.82); }
}

class PrioritiesAnalyst extends WorkerAgent {
  constructor() { super(['priorities', 'value_hierarchies'], 0.85); }
}

class BeliefSystemsExpert extends WorkerAgent {
  constructor() { super(['belief_systems', 'worldview'], 0.78); }
}

class CommunicationExpert extends WorkerAgent {
  constructor() { super(['communication', 'verbal_skills'], 0.90); }
}

class ConflictResolutionSpecialist extends WorkerAgent {
  constructor() { super(['conflict_resolution', 'negotiation'], 0.85); }
}

class HabitFormationCoach extends WorkerAgent {
  constructor() { super(['habits', 'behavior_change'], 0.80); }
}

class SocialDynamicsAnalyst extends WorkerAgent {
  constructor() { super(['social_dynamics', 'group_behavior'], 0.82); }
}

class BodyLanguageReader extends WorkerAgent {
  constructor() { super(['body_language', 'nonverbal_cues'], 0.75); }
}

class DecisionMakingExpert extends WorkerAgent {
  constructor() { super(['decision_making', 'choice_patterns'], 0.88); }
}

class BehavioralEconomist extends WorkerAgent {
  constructor() { super(['behavioral_economics', 'decision_biases'], 0.83); }
}

class RoutineOptimizer extends WorkerAgent {
  constructor() { super(['routines', 'daily_habits'], 0.78); }
}

class MoodRegulationExpert extends WorkerAgent {
  constructor() { super(['mood_regulation', 'emotional_stability'], 0.82); }
}

class EmpathyDevelopmentCoach extends WorkerAgent {
  constructor() { super(['empathy', 'understanding_others'], 0.80); }
}

class AnxietyManagementSpecialist extends WorkerAgent {
  constructor() { super(['anxiety', 'stress_management'], 0.85); }
}

class EmotionalExpressionCoach extends WorkerAgent {
  constructor() { super(['emotional_expression', 'vulnerability'], 0.78); }
}

class RelationshipAttachmentExpert extends WorkerAgent {
  constructor() { super(['relationship_attachment', 'bonding'], 0.88); }
}

class EmotionalPatternsAnalyst extends WorkerAgent {
  constructor() { super(['emotional_patterns', 'triggers'], 0.83); }
}

class CareerDevelopmentCoach extends WorkerAgent {
  constructor() { super(['career', 'professional_goals'], 0.85); }
}

class HealthWellnessAdvisor extends WorkerAgent {
  constructor() { super(['health', 'wellness_practices'], 0.80); }
}

class FinancialPlanningExpert extends WorkerAgent {
  constructor() { super(['finances', 'money_management'], 0.88); }
}

class SocialLifeCoordinator extends WorkerAgent {
  constructor() { super(['social_life', 'community'], 0.75); }
}

class HobbyInterestsCurator extends WorkerAgent {
  constructor() { super(['hobbies', 'interests'], 0.70); }
}

class TravelExperiencePlanner extends WorkerAgent {
  constructor() { super(['travel', 'adventure'], 0.72); }
}

class HomeEnvironmentDesigner extends WorkerAgent {
  constructor() { super(['home_environment', 'living_space'], 0.75); }
}

class TimeManagementOptimizer extends WorkerAgent {
  constructor() { super(['time_management', 'productivity'], 0.82); }
}

class LifeBalanceSpecialist extends WorkerAgent {
  constructor() { super(['life_balance', 'work_life_balance'], 0.85); }
}

class FamilyDynamicsSpecialist extends WorkerAgent {
  constructor() { super(['family_dynamics', 'family_relationships'], 0.82); }
}

class FriendshipDevelopmentCoach extends WorkerAgent {
  constructor() { super(['friendship', 'social_connections'], 0.78); }
}

class IntimacyBuildingExpert extends WorkerAgent {
  constructor() { super(['intimacy', 'emotional_connection'], 0.85); }
}

class RelationshipCommunicationCoach extends WorkerAgent {
  constructor() { super(['relationship_communication', 'couple_talks'], 0.88); }
}

class BoundarySettingSpecialist extends WorkerAgent {
  constructor() { super(['boundaries', 'relationship_limits'], 0.83); }
}

class LoveLanguagesInterpreter extends WorkerAgent {
  constructor() { super(['love_languages', 'affection_styles'], 0.80); }
}

class RelationshipRepairSpecialist extends WorkerAgent {
  constructor() { super(['relationship_repair', 'healing_relationships'], 0.87); }
}

class DatingStrategyAdvisor extends WorkerAgent {
  constructor() { super(['dating_strategy', 'relationship_initiation'], 0.75); }
}

class LongTermCommitmentAnalyst extends WorkerAgent {
  constructor() { super(['commitment', 'relationship_longevity'], 0.85); }
}

export {
  BehaviorExecutive,
  EmotionalExecutive,
  LifestyleExecutive,
  BigFiveResearcher,
  EnneagramSpecialist,
  AttachmentTheorist,
  TemperamentExpert,
  PersonalityDisordersSpecialist,
  MoralPhilosopher,
  CulturalAnthropologist,
  SpiritualAdvisor,
  EthicsSpecialist,
  LifePurposeCoach,
  PrioritiesAnalyst,
  BeliefSystemsExpert,
  CommunicationExpert,
  ConflictResolutionSpecialist,
  HabitFormationCoach,
  SocialDynamicsAnalyst,
  BodyLanguageReader,
  DecisionMakingExpert,
  BehavioralEconomist,
  RoutineOptimizer,
  MoodRegulationExpert,
  EmpathyDevelopmentCoach,
  AnxietyManagementSpecialist,
  EmotionalExpressionCoach,
  RelationshipAttachmentExpert,
  EmotionalPatternsAnalyst,
  CareerDevelopmentCoach,
  HealthWellnessAdvisor,
  FinancialPlanningExpert,
  SocialLifeCoordinator,
  HobbyInterestsCurator,
  TravelExperiencePlanner,
  HomeEnvironmentDesigner,
  TimeManagementOptimizer,
  LifeBalanceSpecialist,
  FamilyDynamicsSpecialist,
  FriendshipDevelopmentCoach,
  IntimacyBuildingExpert,
  RelationshipCommunicationCoach,
  BoundarySettingSpecialist,
  LoveLanguagesInterpreter,
  RelationshipRepairSpecialist,
  DatingStrategyAdvisor,
  LongTermCommitmentAnalyst
};