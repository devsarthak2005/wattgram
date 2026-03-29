pipeline {
    agent any

    environment {
        MAVEN_OPTS = "-Xmx1024m"
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout source code from SCM
                checkout scm
            }
        }
        
        stage('Backend - Build & Test') {
            steps {
                dir('wattram-backend') {
                    // Compile the Spring Boot application and run tests using Maven wrapper
                    script {
                        if (isUnix()) {
                            // Ensure the wrapper is executable
                            sh 'chmod +x mvnw || true'
                            sh './mvnw clean package'
                        } else {
                            bat 'mvnw.cmd clean package'
                        }
                    }
                }
            }
            post {
                always {
                    // Archive JUnit test reports if they exist
                    junit(testResults: 'wattram-backend/target/surefire-reports/*.xml', allowEmptyResults: true)
                }
            }
        }
        
        stage('Frontend - Install & Build') {
            steps {
                dir('Wattgram') {
                    // Install dependencies and build the Vite React application
                    script {
                        if (isUnix()) {
                            sh 'npm install'
                            sh 'npm run build'
                        } else {
                            bat 'npm install'
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Docker - Build Backend Image') {
            // Optional: Only run on main branch or when a specific condition is met
            // when {
            //     branch 'main'
            // }
            steps {
                dir('wattram-backend') {
                    script {
                        echo "Building Docker image for the Spring Boot Backend using the existing Dockerfile..."
                        if (isUnix()) {
                            sh 'docker build -t wattgram-backend:latest .'
                        } else {
                            bat 'docker build -t wattgram-backend:latest .'
                        }
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully! '
        }
        failure {
            echo 'Pipeline failed. Please check the stage logs to investigate the issue. '
        }
    }
}
