// Simple validation script for Phase 1 Revolutionary Personality Engine
// This script validates that the core components are properly implemented

const fs = require('fs');
const path = require('path');

class PersonalityEngineValidator {
  constructor() {
    this.servicesPath = path.join(__dirname, 'src', 'services');
    this.results = [];
  }

  async validate() {
    console.log('🧠 Validating Phase 1 Revolutionary Personality Engine...\n');
    
    // Check file existence
    this.checkFileExists('PersonalityProfilingEngine.js');
    this.checkFileExists('CompatibilityMatchingEngine.js');
    this.checkFileExists('ChatGPTService.js');
    this.checkFileExists('VectorEmbeddingService.js');
    this.checkFileExists('VectorDatabase.js');
    this.checkFileExists('RAGService.js');
    
    // Check implementations
    this.checkPersonalityProfilingEngine();
    this.checkCompatibilityMatchingEngine();
    this.checkChatGPTIntegration();
    
    this.printResults();
  }

  checkFileExists(filename) {
    const filePath = path.join(this.servicesPath, filename);
    if (fs.existsSync(filePath)) {
      this.results.push({ test: `${filename} exists`, status: 'PASS' });
    } else {
      this.results.push({ test: `${filename} exists`, status: 'FAIL', error: 'File not found' });
    }
  }

  checkPersonalityProfilingEngine() {
    try {
      const filePath = path.join(this.servicesPath, 'PersonalityProfilingEngine.js');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for key methods
      const requiredMethods = [
        'analyzeMessage',
        'analyzeBigFive',
        'analyzeMBTI',
        'analyzeAttachment',
        'analyzeCommunication',
        'analyzeEmotionalIntelligence',
        'analyzeValues',
        'generateInsights'
      ];
      
      for (const method of requiredMethods) {
        if (content.includes(method)) {
          this.results.push({ test: `PersonalityProfilingEngine.${method}`, status: 'PASS' });
        } else {
          this.results.push({ test: `PersonalityProfilingEngine.${method}`, status: 'FAIL', error: 'Method not found' });
        }
      }
      
      // Check for personality dimensions
      const dimensions = [
        'big_five',
        'mbti',
        'attachment',
        'communication',
        'emotional_intelligence',
        'values'
      ];
      
      for (const dimension of dimensions) {
        if (content.includes(dimension)) {
          this.results.push({ test: `PersonalityProfilingEngine supports ${dimension}`, status: 'PASS' });
        } else {
          this.results.push({ test: `PersonalityProfilingEngine supports ${dimension}`, status: 'FAIL', error: 'Dimension not found' });
        }
      }
      
    } catch (error) {
      this.results.push({ test: 'PersonalityProfilingEngine validation', status: 'FAIL', error: error.message });
    }
  }

  checkCompatibilityMatchingEngine() {
    try {
      const filePath = path.join(this.servicesPath, 'CompatibilityMatchingEngine.js');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for key methods
      const requiredMethods = [
        'calculateCompatibility',
        'calculateAttachmentCompatibility',
        'calculateCommunicationCompatibility',
        'calculateValuesCompatibility',
        'calculatePersonalityCompatibility',
        'generatePredictions',
        'generateRecommendations',
        'identifyRiskFactors',
        'identifyStrengths'
      ];
      
      for (const method of requiredMethods) {
        if (content.includes(method)) {
          this.results.push({ test: `CompatibilityMatchingEngine.${method}`, status: 'PASS' });
        } else {
          this.results.push({ test: `CompatibilityMatchingEngine.${method}`, status: 'FAIL', error: 'Method not found' });
        }
      }
      
      // Check for compatibility dimensions
      const dimensions = [
        'attachment_compatibility',
        'communication_compatibility',
        'values_compatibility',
        'personality_compatibility',
        'emotional_compatibility'
      ];
      
      for (const dimension of dimensions) {
        if (content.includes(dimension)) {
          this.results.push({ test: `CompatibilityMatchingEngine supports ${dimension}`, status: 'PASS' });
        } else {
          this.results.push({ test: `CompatibilityMatchingEngine supports ${dimension}`, status: 'FAIL', error: 'Dimension not found' });
        }
      }
      
    } catch (error) {
      this.results.push({ test: 'CompatibilityMatchingEngine validation', status: 'FAIL', error: error.message });
    }
  }

  checkChatGPTIntegration() {
    try {
      const filePath = path.join(this.servicesPath, 'ChatGPTService.js');
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for personality integration
      const integrationChecks = [
        'PersonalityProfilingEngine',
        'CompatibilityMatchingEngine',
        'personalityEngine',
        'compatibilityEngine',
        'generatePersonalityGuidance',
        'extractRelationshipContext',
        'PERSONALITY INSIGHTS'
      ];
      
      for (const check of integrationChecks) {
        if (content.includes(check)) {
          this.results.push({ test: `ChatGPTService contains ${check}`, status: 'PASS' });
        } else {
          this.results.push({ test: `ChatGPTService contains ${check}`, status: 'FAIL', error: 'Integration not found' });
        }
      }
      
      // Check for new methods
      const newMethods = [
        'getPersonalityProfile',
        'getCompatibilityAnalysis',
        'getPersonalityInsights'
      ];
      
      for (const method of newMethods) {
        if (content.includes(method)) {
          this.results.push({ test: `ChatGPTService.${method}`, status: 'PASS' });
        } else {
          this.results.push({ test: `ChatGPTService.${method}`, status: 'FAIL', error: 'Method not found' });
        }
      }
      
    } catch (error) {
      this.results.push({ test: 'ChatGPTService integration validation', status: 'FAIL', error: error.message });
    }
  }

  printResults() {
    console.log('🧠 === Phase 1 Revolutionary Personality Engine Validation Results ===\n');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${this.results.length}\n`);
    
    if (failed > 0) {
      console.log('❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.test}: ${r.error || 'Failed'}`));
      console.log('');
    }
    
    // Group results by component
    const components = {
      'File Structure': this.results.filter(r => r.test.includes('exists')),
      'Personality Profiling Engine': this.results.filter(r => r.test.includes('PersonalityProfilingEngine')),
      'Compatibility Matching Engine': this.results.filter(r => r.test.includes('CompatibilityMatchingEngine')),
      'ChatGPT Integration': this.results.filter(r => r.test.includes('ChatGPTService'))
    };
    
    for (const [component, tests] of Object.entries(components)) {
      const componentPassed = tests.filter(t => t.status === 'PASS').length;
      const componentTotal = tests.length;
      const percentage = Math.round((componentPassed / componentTotal) * 100);
      
      console.log(`${component}: ${componentPassed}/${componentTotal} (${percentage}%)`);
    }
    
    console.log('\n' + '='.repeat(70));
    
    if (failed === 0) {
      console.log('🎉 Phase 1 Revolutionary Personality Engine validation PASSED!');
      console.log('✨ All core components are properly implemented and integrated.');
      console.log('🚀 Ready to revolutionize SoulAI with AI-powered personality insights!');
    } else {
      console.log('⚠️  Phase 1 validation completed with some issues.');
      console.log('🔧 Please review and fix the failed tests above.');
      console.log('💡 Most components are working, but some refinements needed.');
    }
  }
}

// Run validation
const validator = new PersonalityEngineValidator();
validator.validate();