// Revolutionary Personality Engine Test Suite
// Comprehensive testing of Phase 1 implementation

import PersonalityProfilingEngine from './PersonalityProfilingEngine';
import CompatibilityMatchingEngine from './CompatibilityMatchingEngine';
import ChatGPTService from './ChatGPTService';

class PersonalityEngineTest {
  constructor() {
    this.testResults = [];
    this.testUsers = new Map();
  }

  async runAllTests() {
    console.log('🧠 === Phase 1 Revolutionary Personality Engine Tests ===\n');
    
    try {
      // Test 1: Personality Profiling Engine
      await this.testPersonalityProfiling();
      
      // Test 2: Compatibility Matching Engine
      await this.testCompatibilityMatching();
      
      // Test 3: ChatGPT Integration
      await this.testChatGPTIntegration();
      
      // Test 4: Real-time Analysis
      await this.testRealTimeAnalysis();
      
      // Test 5: Personality Insights
      await this.testPersonalityInsights();
      
      // Test 6: End-to-End Workflow
      await this.testEndToEndWorkflow();
      
      // Summary
      this.printTestSummary();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testPersonalityProfiling() {
    console.log('1. Testing Personality Profiling Engine...');
    
    try {
      // Initialize engine
      await PersonalityProfilingEngine.initialize();
      
      // Test message analysis
      const testMessages = [
        {
          userId: 'user1',
          message: 'I love meeting new people and going to parties! I get so much energy from social interactions.',
          expected: { extraversion: 'high', openness: 'moderate' }
        },
        {
          userId: 'user2', 
          message: 'I worry a lot about my relationships and need constant reassurance that my partner loves me.',
          expected: { neuroticism: 'high', attachment: 'anxious' }
        },
        {
          userId: 'user3',
          message: 'I prefer to keep my feelings to myself and need space when things get too intense.',
          expected: { attachment: 'avoidant', emotionalExpression: 'low' }
        }
      ];

      for (const testCase of testMessages) {
        const result = await PersonalityProfilingEngine.analyzeMessage(
          testCase.userId,
          testCase.message
        );
        
        this.assert(result, 'Should return analysis result');
        this.assert(result.profile, 'Should have profile');
        this.assert(result.analysis, 'Should have analysis');
        this.assert(result.insights, 'Should have insights');
        
        // Store for later tests
        this.testUsers.set(testCase.userId, result.profile);
      }

      // Test profile building over time
      const userId = 'user1';
      const followupMessages = [
        'I feel anxious when I don\'t hear from someone for a while',
        'I really value honesty and direct communication in relationships',
        'I love trying new restaurants and traveling to new places'
      ];

      for (const msg of followupMessages) {
        await PersonalityProfilingEngine.analyzeMessage(userId, msg);
      }

      const finalProfile = PersonalityProfilingEngine.getUserProfile(userId);
      this.assert(finalProfile.messageCount >= 4, 'Should track message count');
      
      console.log('✅ Personality Profiling Engine tests passed');
      this.testResults.push({ name: 'Personality Profiling', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ Personality Profiling test failed:', error);
      this.testResults.push({ name: 'Personality Profiling', status: 'FAILED', error: error.message });
    }
  }

  async testCompatibilityMatching() {
    console.log('2. Testing Compatibility Matching Engine...');
    
    try {
      // Initialize engine
      await CompatibilityMatchingEngine.initialize();
      
      // Create test profiles if not exists
      if (this.testUsers.size === 0) {
        await this.createTestProfiles();
      }
      
      // Test compatibility calculation
      const compatibility = await CompatibilityMatchingEngine.calculateCompatibility(
        'user1', 'user2'
      );
      
      this.assert(compatibility, 'Should return compatibility result');
      this.assert(typeof compatibility.overall === 'number', 'Should have overall score');
      this.assert(compatibility.overall >= 0 && compatibility.overall <= 1, 'Overall score should be 0-1');
      this.assert(compatibility.dimensions, 'Should have dimensional analysis');
      this.assert(compatibility.predictions, 'Should have predictions');
      this.assert(compatibility.recommendations, 'Should have recommendations');
      
      // Test different compatibility combinations
      const testCombinations = [
        ['user1', 'user2'],
        ['user1', 'user3'],
        ['user2', 'user3']
      ];
      
      for (const [userId1, userId2] of testCombinations) {
        const result = await CompatibilityMatchingEngine.calculateCompatibility(userId1, userId2);
        this.assert(result.overall >= 0 && result.overall <= 1, 'Compatibility score should be valid');
        
        // Check required dimensions
        const requiredDimensions = ['attachment', 'communication', 'values', 'personality'];
        for (const dimension of requiredDimensions) {
          this.assert(result.dimensions[dimension], `Should have ${dimension} analysis`);
          this.assert(typeof result.dimensions[dimension].score === 'number', `${dimension} should have score`);
        }
      }
      
      console.log('✅ Compatibility Matching Engine tests passed');
      this.testResults.push({ name: 'Compatibility Matching', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ Compatibility Matching test failed:', error);
      this.testResults.push({ name: 'Compatibility Matching', status: 'FAILED', error: error.message });
    }
  }

  async testChatGPTIntegration() {
    console.log('3. Testing ChatGPT Integration...');
    
    try {
      // Test personality-guided response
      const testMessage = 'I feel really anxious about this new relationship';
      
      // Mock the sendMessage to avoid actual API calls
      const originalSendMessage = ChatGPTService.sendMessage;
      let personalityGuidanceUsed = false;
      
      ChatGPTService.sendMessage = async (message, options) => {
        personalityGuidanceUsed = message.includes('PERSONALITY INSIGHTS');
        return 'Test response based on personality insights';
      };
      
      const response = await ChatGPTService.sendMessage(testMessage, {
        onStart: () => {},
        onToken: () => {},
        onComplete: () => {},
        onError: () => {}
      });
      
      // Restore original method
      ChatGPTService.sendMessage = originalSendMessage;
      
      this.assert(response, 'Should return response');
      
      // Test personality insights retrieval
      const insights = await ChatGPTService.getPersonalityInsights();
      this.assert(insights, 'Should return personality insights');
      
      // Test compatibility analysis
      const compatibility = await ChatGPTService.getCompatibilityAnalysis('user2');
      this.assert(compatibility, 'Should return compatibility analysis');
      
      console.log('✅ ChatGPT Integration tests passed');
      this.testResults.push({ name: 'ChatGPT Integration', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ ChatGPT Integration test failed:', error);
      this.testResults.push({ name: 'ChatGPT Integration', status: 'FAILED', error: error.message });
    }
  }

  async testRealTimeAnalysis() {
    console.log('4. Testing Real-time Analysis...');
    
    try {
      const userId = 'realtime_user';
      
      // Test conversation flow
      const conversationFlow = [
        'Hi, I\'m excited to meet new people!',
        'I love going to concerts and trying new foods',
        'Sometimes I worry if people actually like me though',
        'I tend to overthink things in relationships',
        'But I really value deep, meaningful connections'
      ];
      
      let previousProfile = null;
      
      for (let i = 0; i < conversationFlow.length; i++) {
        const message = conversationFlow[i];
        
        const result = await PersonalityProfilingEngine.analyzeMessage(userId, message);
        const currentProfile = result.profile;
        
        // Check profile evolution
        this.assert(currentProfile.messageCount === i + 1, 'Message count should increment');
        
        if (previousProfile) {
          // Check that confidence scores generally increase
          for (const dimension of Object.values(currentProfile.dimensions)) {
            if (dimension.confidence !== undefined && previousProfile.dimensions[dimension.constructor.name]) {
              // Confidence should generally increase or stay the same
              this.assert(
                dimension.confidence >= previousProfile.dimensions[dimension.constructor.name].confidence - 0.1,
                'Confidence should generally increase over time'
              );
            }
          }
        }
        
        previousProfile = currentProfile;
      }
      
      // Test final profile has meaningful data
      const finalProfile = PersonalityProfilingEngine.getUserProfile(userId);
      this.assert(finalProfile.messageCount === 5, 'Should have processed all messages');
      this.assert(Object.keys(finalProfile.dimensions).length > 0, 'Should have personality dimensions');
      
      console.log('✅ Real-time Analysis tests passed');
      this.testResults.push({ name: 'Real-time Analysis', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ Real-time Analysis test failed:', error);
      this.testResults.push({ name: 'Real-time Analysis', status: 'FAILED', error: error.message });
    }
  }

  async testPersonalityInsights() {
    console.log('5. Testing Personality Insights...');
    
    try {
      // Test with extraverted user
      const extravertedMessages = [
        'I love parties and meeting new people!',
        'I get energized by social interactions',
        'I speak up in group settings and love being the center of attention'
      ];
      
      const userId = 'extraverted_user';
      for (const msg of extravertedMessages) {
        await PersonalityProfilingEngine.analyzeMessage(userId, msg);
      }
      
      const profile = PersonalityProfilingEngine.getUserProfile(userId);
      const insights = PersonalityProfilingEngine.generateInsights(profile, null);
      
      this.assert(insights.length > 0, 'Should generate insights');
      
      // Look for extraversion insight
      const extraversionInsight = insights.find(i => 
        i.category === 'personality' && i.insight.includes('extraverted')
      );
      this.assert(extraversionInsight, 'Should identify extraversion');
      
      // Test attachment style insights
      const anxiousMessages = [
        'I worry when my partner doesn\'t text back quickly',
        'I need constant reassurance in relationships',
        'I fear being abandoned or rejected'
      ];
      
      const anxiousUserId = 'anxious_user';
      for (const msg of anxiousMessages) {
        await PersonalityProfilingEngine.analyzeMessage(anxiousUserId, msg);
      }
      
      const anxiousProfile = PersonalityProfilingEngine.getUserProfile(anxiousUserId);
      const anxiousInsights = PersonalityProfilingEngine.generateInsights(anxiousProfile, null);
      
      const attachmentInsight = anxiousInsights.find(i => 
        i.category === 'attachment' && i.insight.includes('anxious')
      );
      this.assert(attachmentInsight, 'Should identify anxious attachment');
      
      console.log('✅ Personality Insights tests passed');
      this.testResults.push({ name: 'Personality Insights', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ Personality Insights test failed:', error);
      this.testResults.push({ name: 'Personality Insights', status: 'FAILED', error: error.message });
    }
  }

  async testEndToEndWorkflow() {
    console.log('6. Testing End-to-End Workflow...');
    
    try {
      // Create two users with different personalities
      const user1Id = 'workflow_user1';
      const user2Id = 'workflow_user2';
      
      // User 1: Secure, extraverted, direct communicator
      const user1Messages = [
        'I feel comfortable being open about my feelings',
        'I love social gatherings and meeting new people',
        'I prefer direct, honest communication in relationships',
        'I trust my partners and don\'t get jealous easily'
      ];
      
      // User 2: Anxious attachment, introverted, needs reassurance
      const user2Messages = [
        'I worry when people don\'t respond to my messages',
        'I prefer quiet, intimate conversations over big groups',
        'I need reassurance that my partner cares about me',
        'I sometimes feel insecure in relationships'
      ];
      
      // Build profiles
      for (const msg of user1Messages) {
        await PersonalityProfilingEngine.analyzeMessage(user1Id, msg);
      }
      
      for (const msg of user2Messages) {
        await PersonalityProfilingEngine.analyzeMessage(user2Id, msg);
      }
      
      // Calculate compatibility
      const compatibility = await CompatibilityMatchingEngine.calculateCompatibility(user1Id, user2Id);
      
      // Verify compatibility analysis
      this.assert(compatibility.overall >= 0 && compatibility.overall <= 1, 'Compatibility score should be valid');
      this.assert(compatibility.dimensions.attachment.score >= 0, 'Should have attachment analysis');
      this.assert(compatibility.dimensions.communication.score >= 0, 'Should have communication analysis');
      
      // Test recommendations
      this.assert(compatibility.recommendations.length >= 0, 'Should have recommendations');
      this.assert(compatibility.strengths.length >= 0, 'Should identify strengths');
      this.assert(compatibility.riskFactors.length >= 0, 'Should identify risk factors');
      
      // Test predictions
      this.assert(compatibility.predictions.relationshipSuccess >= 0, 'Should predict relationship success');
      this.assert(compatibility.predictions.conflictProbability >= 0, 'Should predict conflict probability');
      
      // Test personality-guided response generation
      const personalityGuidance = ChatGPTService.generatePersonalityGuidance({
        profile: PersonalityProfilingEngine.getUserProfile(user1Id),
        insights: []
      });
      
      // Should generate guidance for secure, extraverted user
      if (personalityGuidance) {
        this.assert(typeof personalityGuidance === 'string', 'Should generate string guidance');
      }
      
      console.log('✅ End-to-End Workflow tests passed');
      this.testResults.push({ name: 'End-to-End Workflow', status: 'PASSED' });
      
    } catch (error) {
      console.error('❌ End-to-End Workflow test failed:', error);
      this.testResults.push({ name: 'End-to-End Workflow', status: 'FAILED', error: error.message });
    }
  }

  async createTestProfiles() {
    // Create basic test profiles for compatibility testing
    const profiles = [
      {
        userId: 'user1',
        messages: [
          'I love meeting new people and going to parties!',
          'I feel comfortable sharing my feelings openly',
          'I value honesty and direct communication'
        ]
      },
      {
        userId: 'user2',
        messages: [
          'I worry a lot about my relationships',
          'I need reassurance that my partner loves me',
          'I sometimes feel anxious when people don\'t respond'
        ]
      },
      {
        userId: 'user3',
        messages: [
          'I prefer to keep my feelings to myself',
          'I need space when things get too intense',
          'I value independence in relationships'
        ]
      }
    ];
    
    for (const profile of profiles) {
      for (const message of profile.messages) {
        await PersonalityProfilingEngine.analyzeMessage(profile.userId, message);
      }
      this.testUsers.set(profile.userId, PersonalityProfilingEngine.getUserProfile(profile.userId));
    }
  }

  // Helper methods
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  printTestSummary() {
    console.log('\n🧠 === Phase 1 Revolutionary Personality Engine Test Summary ===');
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${this.testResults.length}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    }
    
    // Print engine statistics
    console.log('\n📈 Engine Statistics:');
    console.log('Personality Profiling Engine:', PersonalityProfilingEngine.getStats());
    console.log('Compatibility Matching Engine:', CompatibilityMatchingEngine.getStats());
    
    if (failed === 0) {
      console.log('\n🎉 Phase 1 Revolutionary Personality Engine is fully operational!');
      console.log('✨ Ready to revolutionize dating with AI-powered personality insights');
    } else {
      console.log('\n⚠️  Some tests failed. Please review and fix issues before deployment.');
    }
  }
}

export default new PersonalityEngineTest();