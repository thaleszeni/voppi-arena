'use client';

import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import styles from './page.module.css';

export default function AdminManualPage() {
    return (
        <>
            <Navbar />
            <div className={styles.pageWrapper}>
                <Sidebar />
                <main className={styles.mainContent}>
                    <h1>📖 Manual do Administrador</h1>
                    <p>Documentação em construção.</p>
                </main>
            </div>
        </>
    );
}
