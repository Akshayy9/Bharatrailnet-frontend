// Mock API service for demo purposes
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:8000'
  }

  // Simulate API delay
  async mockDelay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async login(credentials) {
    await this.mockDelay()
    
    // Demo credentials
    if (credentials.username === 'SK001' && credentials.password === 'demo123') {
      return {
        success: true,
        access_token: 'demo-token-' + Date.now(),
        user: {
          name: 'Demo Controller',
          section: credentials.section,
          employeeId: credentials.username
        }
      }
    }
    
    throw new Error('Invalid credentials. Use SK001/demo123')
  }

  async getDashboardKPIs() {
    await this.mockDelay()
    
    return {
      punctuality: parseFloat((95 + Math.random() * 5).toFixed(1)),
      averageDelay: parseFloat((Math.random() * 10).toFixed(1)),
      sectionThroughput: Math.floor(15 + Math.random() * 10),
      trackUtilization: Math.floor(75 + Math.random() * 20)
    }
  }

  async getTrains() {
    await this.mockDelay()
    
    const statuses = ['On Time', 'Delayed', 'Conflict']
    const trains = [
      { id: '12004', name: 'Shatabdi Exp', location: 'Approaching GZB' },
      { id: '12451', name: 'Shram Shakti', location: 'Aligarh Jn.' },
      { id: '12002', name: 'Rajdhani Exp', location: 'Tundla Jn.' },
      { id: '09876', name: 'Goods Train', location: 'Dadri' },
      { id: '12312', name: 'Kalka Mail', location: 'Saharanpur' },
      { id: '14554', name: 'Himachal Exp', location: 'Muzaffarnagar' }
    ]

    return trains.map(train => ({
      ...train,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      recommendation: Math.random() > 0.7 ? 'View' : '-'
    }))
  }

  async getThroughputChart() {
    await this.mockDelay()
    
    const hours = Array.from({length: 24}, (_, i) => 
      String(i).padStart(2, '0') + ':00'
    )
    
    const data = hours.map(() => Math.floor(8 + Math.random() * 20))
    
    return {
      labels: hours,
      data: data
    }
  }

  async acceptRecommendation() {
    await this.mockDelay()
    
    return {
      success: true,
      message: 'Recommendation executed successfully'
    }
  }

  async runSimulation(scenario) {
    await this.mockDelay(1000) // Longer delay for simulation
    
    return {
      success: true,
      results: {
        originalDelay: 15,
        optimizedDelay: 7,
        impactedTrains: ['12451', '09876'],
        recommendation: 'Halt Train 09876 for 7 minutes at Aligarh Junction'
      }
    }
  }

  async getAuditTrail() {
    await this.mockDelay()
    
    const actions = [
      'AI Recommendation Accepted',
      'Manual Override Applied',
      'Schedule Updated',
      'Simulation Run'
    ]
    
    return Array.from({length: 20}, (_, i) => ({
      id: i + 1,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      action: actions[Math.floor(Math.random() * actions.length)],
      user: 'SK001',
      details: `Action performed on train ${12000 + Math.floor(Math.random() * 1000)}`
    }))
  }
}

export const apiService = new ApiService()
