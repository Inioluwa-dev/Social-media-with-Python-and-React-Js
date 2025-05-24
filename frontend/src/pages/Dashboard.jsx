
import React, { useContext } from 'react';
import { Container, Navbar, Button, Card } from 'react-bootstrap';
import { AuthContext } from '@contexts/AuthContext';
import styles from '@styles/auth/Signup.module.css';

const Dashboard = () => {
    const { logout, user } = useContext(AuthContext);

    return (
        <Container fluid className={styles.authContainer}>
            <Navbar bg="light" expand="lg" className="mb-4">
                <Container>
                    <Navbar.Brand>Kefi Dashboard</Navbar.Brand>
                    <Button
                        variant="outline-primary"
                        className={`${styles.likeBtn} d-flex align-items-center`}
                        onClick={logout}
                        title="Sign Out"
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Sign Out
                    </Button>
                </Container>
            </Navbar>
            <Card className={styles.authCard}>
                <Card.Body className={styles.cardBody}>
                    <div className="text-center">
                        <h2>Welcome, {user?.username || 'User'}!</h2>
                        <p>Your Kefi journey starts here. Explore and connect!</p>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Dashboard;
