pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/HaryKurniawan/e-tat_backend.git'
            }
        }
        stage('Sync & Deploy Backend Container') {
            steps {
                sh '''
                    cd /opt/etat/repos/backend && git pull origin main
                    cd /opt/etat
                    docker compose build be
                    docker compose up -d --no-deps be
                '''
            }
        }
        stage('Health Check') {
            steps {
                sh '''
                    sleep 5
                    curl -sf http://be:5000/api/health || curl -sf http://localhost:5000/api/health
                '''
            }
        }
    }
}
