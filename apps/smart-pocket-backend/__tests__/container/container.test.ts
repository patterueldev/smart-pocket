import { ServiceContainer } from '../../src/container';

describe('ServiceContainer', () => {
  let container: ServiceContainer;

  beforeEach(() => {
    container = new ServiceContainer();
  });

  describe('Singleton Registration and Retrieval', () => {
    it('should register and retrieve a singleton service', () => {
      const mockService = { name: 'TestService' };
      container.registerSingleton('testService', () => mockService);

      const retrieved = container.getSingleton('testService');
      expect(retrieved).toBe(mockService);
    });

    it('should return same instance on multiple calls for singleton', () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { id: callCount };
      };

      container.registerSingleton('service', factory);

      const first = container.getSingleton('service') as any;
      const second = container.getSingleton('service') as any;

      expect(first).toBe(second);
      expect(callCount).toBe(1);
    });

    it('should cache singleton after first retrieval', () => {
      const factory = jest.fn(() => ({ value: 'test' }));
      container.registerSingleton('cached', factory);

      container.getSingleton('cached');
      container.getSingleton('cached');
      container.getSingleton('cached');

      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should throw error when retrieving unregistered singleton', () => {
      expect(() => {
        container.getSingleton('nonexistent');
      }).toThrow('Service "nonexistent" not registered');
    });
  });

  describe('Factory Registration and Retrieval', () => {
    it('should register and retrieve factory services', () => {
      const factory = jest.fn(() => ({ instance: 'new' }));
      container.registerFactory('factory', factory);

      const result = container.getFactory('factory');
      expect(result).toBeDefined();
      expect(factory).toHaveBeenCalled();
    });

    it('should create new instance each time for factory', () => {
      let instanceCount = 0;
      const factory = () => ({
        id: ++instanceCount,
      });

      container.registerFactory('factory', factory);

      const first = container.getFactory('factory') as any;
      const second = container.getFactory('factory') as any;

      expect(first.id).toBe(1);
      expect(second.id).toBe(2);
      expect(first).not.toBe(second);
    });

    it('should throw error when getting unregistered factory', () => {
      expect(() => {
        container.getFactory('nonexistent');
      }).toThrow('Factory service "nonexistent" not registered');
    });

    it('should throw error when treating singleton as factory', () => {
      container.registerSingleton('singleton', () => ({}));

      expect(() => {
        container.getFactory('singleton');
      }).toThrow('Factory service "singleton" not registered');
    });
  });

  describe('Generic Get Method', () => {
    it('should retrieve singleton via generic get method', () => {
      const mockService = { type: 'singleton' };
      container.registerSingleton('service', () => mockService);

      const retrieved = container.get('service');
      expect(retrieved).toBe(mockService);
    });

    it('should retrieve factory via generic get method', () => {
      const factory = jest.fn(() => ({ type: 'factory' }));
      container.registerFactory('service', factory);

      const retrieved = container.get('service');
      expect(retrieved).toBeDefined();
      expect(factory).toHaveBeenCalled();
    });

    it('should create different instances for factory on multiple gets', () => {
      let count = 0;
      container.registerFactory('factory', () => ({ id: ++count }));

      const first = container.get('factory') as any;
      const second = container.get('factory') as any;

      expect(first.id).toBe(1);
      expect(second.id).toBe(2);
    });

    it('should return same instance for singleton on multiple gets', () => {
      const factory = jest.fn(() => ({}));
      container.registerSingleton('singleton', factory);

      container.get('singleton');
      container.get('singleton');

      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should throw error for unregistered service', () => {
      expect(() => {
        container.get('missing');
      }).toThrow('Service "missing" not registered');
    });
  });

  describe('Clear Method', () => {
    it('should clear cached singletons', () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { id: callCount };
      };

      container.registerSingleton('service', factory);

      const first = container.getSingleton('service') as any;
      expect(first.id).toBe(1);

      container.clear();

      const second = container.getSingleton('service') as any;
      expect(second.id).toBe(2);
      expect(callCount).toBe(2);
    });

    it('should allow re-initialization after clear', () => {
      container.registerSingleton('service', () => ({ value: 1 }));
      const first = container.getSingleton('service');

      container.clear();

      container.registerSingleton('service', () => ({ value: 2 }));
      expect(() => container.getSingleton('service')).not.toThrow();
    });
  });

  describe('Complex Service Scenarios', () => {
    it('should handle services with dependencies', () => {
      interface Service1 {
        name: string;
      }
      interface Service2 {
        depend: Service1;
      }

      const service1 = { name: 'Service1' };
      container.registerSingleton<Service1>('service1', () => service1);

      const service2Factory = () => ({
        depend: container.get<Service1>('service1'),
      });
      container.registerSingleton<Service2>('service2', service2Factory);

      const result = container.get<Service2>('service2');
      expect((result as any).depend).toBe(service1);
    });

    it('should maintain multiple different services', () => {
      const service1 = { type: 'service1' };
      const service2 = { type: 'service2' };
      const service3 = { type: 'service3' };

      container.registerSingleton('s1', () => service1);
      container.registerSingleton('s2', () => service2);
      container.registerFactory('s3', () => service3);

      expect(container.get('s1')).toBe(service1);
      expect(container.get('s2')).toBe(service2);
      expect(container.get('s3')).toBe(service3);
    });

    it('should handle services with constructor-like behavior', () => {
      class MockService {
        public initialized: boolean = false;

        constructor() {
          this.initialized = true;
        }
      }

      container.registerSingleton('mockService', () => new MockService());
      const service = container.getSingleton('mockService') as any;

      expect(service.initialized).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should preserve type information for registered services', () => {
      interface TestService {
        getValue(): string;
      }

      const testService: TestService = {
        getValue: () => 'test',
      };

      container.registerSingleton<TestService>('test', () => testService);
      const retrieved = container.get<TestService>('test');

      expect((retrieved as any).getValue()).toBe('test');
    });
  });
});
