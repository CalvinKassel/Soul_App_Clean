class ProgressTracker {
  constructor() {
    // Define the "haircut" stages - clear milestones toward recommendations
    this.stages = [
      {
        name: 'Getting to Know You',
        description: 'Understanding your personality and communication style',
        progress: { min: 0, max: 20 },
        requirements: ['basic_personality', 'communication_style'],
        icon: '🌱',
        userMessage: "I'm getting to know your unique personality and how you connect with others."
      },
      {
        name: 'Discovering Your Values',
        description: 'Learning what matters most to you in relationships',
        progress: { min: 20, max: 40 },
        requirements: ['core_values', 'relationship_goals'],
        icon: '💎',
        userMessage: "We're discovering the values and qualities that are most important to you."
      },
      {
        name: 'Understanding Your Heart',
        description: 'Exploring what makes you feel loved and understood',
        progress: { min: 40, max: 60 },
        requirements: ['love_language', 'emotional_needs', 'deal_breakers'],
        icon: '❤️',
        userMessage: "I'm learning what makes your heart feel truly understood and appreciated."
      },
      {
        name: 'Mapping Your Compatibility',
        description: 'Building your complete compatibility profile',
        progress: { min: 60, max: 80 },
        requirements: ['lifestyle_preferences', 'conflict_style', 'future_vision'],
        icon: '🧭',
        userMessage: "We're mapping out your complete compatibility blueprint."
      },
      {
        name: 'Ready for Magic',
        description: 'Preparing your first curated recommendations',
        progress: { min: 80, max: 100 },
        requirements: ['profile_complete'],
        icon: '✨',
        userMessage: "You're ready! I'm excited to introduce you to some amazing people."
      }
    ];
  }

  getCurrentStage(profileCompleteness) {
    for (let i = 0; i < this.stages.length; i++) {
      const stage = this.stages[i];
      if (profileCompleteness >= stage.progress.min && profileCompleteness < stage.progress.max) {
        return {
          ...stage,
          currentProgress: profileCompleteness,
          progressInStage: ((profileCompleteness - stage.progress.min) / (stage.progress.max - stage.progress.min)) * 100,
          nextStage: this.stages[i + 1] || null,
          stageNumber: i + 1,
          totalStages: this.stages.length
        };
      }
    }
    
    // If 100% complete
    return {
      ...this.stages[this.stages.length - 1],
      currentProgress: 100,
      progressInStage: 100,
      nextStage: null,
      stageNumber: this.stages.length,
      totalStages: this.stages.length
    };
  }

  generateProgressMessage(currentStage, isNewStage = false) {
    if (isNewStage) {
      return `🎉 **New Stage Unlocked!** ${currentStage.icon}

**${currentStage.name}**
${currentStage.userMessage}

*Progress: ${currentStage.stageNumber}/${currentStage.totalStages} stages complete*`;
    }

    const remainingProgress = Math.round(currentStage.progress.max - currentStage.currentProgress);
    
    return `${currentStage.icon} **${currentStage.name}** (Stage ${currentStage.stageNumber}/${currentStage.totalStages})
${currentStage.userMessage}

*About ${remainingProgress}% more to unlock ${currentStage.nextStage ? currentStage.nextStage.name : 'your matches'}*`;
  }

  getTimeEstimate(currentStage) {
    const questionsRemaining = Math.ceil((currentStage.progress.max - currentStage.currentProgress) / 5);
    return `${questionsRemaining} more thoughtful questions`;
  }
}

module.exports = ProgressTracker;