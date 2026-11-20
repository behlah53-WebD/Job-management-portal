import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getCompanies } from '@/lib/dataService';
import { MapPin, Users, Globe, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from './companies.module.css';

export const metadata = {
  title: 'Companies — Verdant',
  description: 'Explore conscious employers and flourishing studios hiring on Verdant.',
};

export default async function CompaniesPage() {
  let companies = [];
  try {
    companies = await getCompanies();
  } catch (err) {
    console.error('Companies page fetch error:', err);
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <main className="container" style={{ paddingTop: '48px', paddingBottom: '96px' }}>
        <div className={styles.header}>
          <span className={styles.subTitle}>Company Directory</span>
          <h1 className={styles.title}>Flourishing Teams & Studios</h1>
          <p className={styles.desc}>
            Discover verified companies that believe in calm culture, healthy boundaries, and dignified career growth.
          </p>
        </div>

        <div className={styles.grid}>
          {companies.map((comp) => (
            <Card key={comp._id} className={styles.companyCard} padding="normal" hoverable>
              <div className={styles.cardTop}>
                <div className={styles.logoWrapper}>
                  {comp.logo ? (
                    <Image
                      src={comp.logo}
                      alt={comp.name}
                      width={64}
                      height={64}
                      className={styles.logoImg}
                    />
                  ) : (
                    <div className={styles.logoFallback}>{comp.name[0]}</div>
                  )}
                </div>
                <div className={styles.meta}>
                  <div className={styles.nameRow}>
                    <h3 className={styles.name}>{comp.name}</h3>
                    {comp.isVerified && (
                      <span className={styles.verifiedTick} title="Verified Company">
                        <CheckCircle2 size={16} />
                      </span>
                    )}
                  </div>
                  <span className={styles.industry}>{comp.industry}</span>
                </div>
              </div>

              <p className={styles.about}>{comp.about}</p>

              <div className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <MapPin size={15} />
                  <span>{comp.location}</span>
                </div>
                <div className={styles.detailItem}>
                  <Users size={15} />
                  <span>{comp.size} team members</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <Link href={`/jobs?q=${encodeURIComponent(comp.name)}`}>
                  <Button variant="secondary" size="sm">
                    View Open Roles
                  </Button>
                </Link>
                {comp.website && (
                  <a
                    href={comp.website}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.webBtn}
                    aria-label="Visit company website"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
