"use client";

import React from "react";
import Link from "next/link";

interface DownloadCardProps {
    os: "windows" | "mac" | "linux";
    title: string;
    description: string;
    link: string;
    version: string;
}

const DownloadCard: React.FC<DownloadCardProps> = ({
    os,
    title,
    description,
    link,
    version,
}) => {
    const getIcon = () => {
        switch (os) {
            case "windows":
                return "🪟";
            case "mac":
                return "🍎";
            case "linux":
                return "🐧";
            default:
                return "💻";
        }
    };

    return (
        <Link href={link} className="download-card" target="_blank" rel="noopener noreferrer">
            <div className="download-icon">{getIcon()}</div>
            <h3>{title}</h3>
            <p>{description}</p>
            <div className="download-meta">
                <span className="version">{version}</span>
                <button className="download-btn">Download</button>
            </div>
        </Link>
    );
};

export default function DownloadSection() {
    const GITHUB_RELEASES = "https://github.com/0xtdey/polywhale/releases/latest";

    return (
        <section className="download-section" id="download">
            <div className="download-container">
                <h2>Get PolyWhale for Desktop</h2>
                <p className="subtitle">
                    Experience the full power of whale tracking on your preferred operating system.
                </p>

                <div className="download-grid">
                    <DownloadCard
                        os="windows"
                        title="Windows"
                        description="Compatible with Windows 10 and 11"
                        link={GITHUB_RELEASES}
                        version="v1.0.0"
                    />
                    <DownloadCard
                        os="mac"
                        title="macOS"
                        description="Apple Silicon and Intel support"
                        link={GITHUB_RELEASES}
                        version="v1.0.0"
                    />
                    <DownloadCard
                        os="linux"
                        title="Linux"
                        description=".deb and .AppImage available"
                        link={GITHUB_RELEASES}
                        version="v1.0.0"
                    />
                </div>
            </div>
        </section>
    );
}
