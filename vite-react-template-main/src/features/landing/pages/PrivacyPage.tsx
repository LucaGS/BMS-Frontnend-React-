import React from 'react';

const PrivacyPage: React.FC = () => (
  <section className="py-5 legal-page">
    <div className="d-flex flex-column gap-4">
      <div>
        <div className="auth-kicker mb-2">Datenschutz</div>
        <h1 className="h3 fw-semibold mb-3">Datenschutzerklärung</h1>
        <p className="text-muted mb-0">
          Diese Anwendung verarbeitet personenbezogene Daten ausschließlich zur Bereitstellung der Baum- und
          Grünflächenverwaltung. Die folgenden Hinweise beschreiben Art, Umfang und Zweck der Verarbeitung.
        </p>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body d-flex flex-column gap-4">
          <section>
            <h2 className="h5">1. Verantwortlicher</h2>
            <p className="mb-0">
              Verantwortlich für die Datenverarbeitung ist Luca Stieme, Die Premenäcker 2D, 61138 Niederdorfelden,
              Deutschland, E-Mail: luca.stieme@outlook.de.
            </p>
          </section>

          <section>
            <h2 className="h5">2. Verarbeitete Daten</h2>
            <p>
              Bei der Nutzung der Anwendung können insbesondere folgende Daten verarbeitet werden:
            </p>
            <ul className="mb-0">
              <li>Bestandsdaten wie Benutzername und E-Mail-Adresse</li>
              <li>Anmeldedaten und Sitzungsinformationen einschließlich JWT-basierter Anmeldezustände</li>
              <li>Fachliche Verwaltungsdaten zu Bäumen, Grünflächen, Kontrollen, Bildern und Dokumentationen</li>
              <li>Technische Protokoll- und Verbindungsdaten, die zur sicheren Bereitstellung des Dienstes erforderlich sind</li>
              <li>Karten- und Standortdaten, sofern Baum- oder Grünflächenkoordinaten angezeigt oder bearbeitet werden</li>
            </ul>
          </section>

          <section>
            <h2 className="h5">3. Zwecke und Rechtsgrundlagen</h2>
            <p>
              Die Verarbeitung erfolgt zur Bereitstellung der Anwendung, zur Authentifizierung von Nutzerinnen und Nutzern,
              zur Verwaltung von Baum- und Grünflächendaten sowie zur technischen Stabilität und Sicherheit des Systems.
            </p>
            <p className="mb-0">
              Rechtsgrundlagen können insbesondere Art. 6 Abs. 1 lit. b DSGVO (Vertrag oder vorvertragliche Maßnahmen),
              Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtungen) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
              an sicherem und funktionsfähigem Betrieb) sein. Welche Grundlage im Einzelfall einschlägig ist, hängt von der
              konkreten Nutzung der Anwendung ab.
            </p>
          </section>

          <section>
            <h2 className="h5">4. Hosting und Empfänger</h2>
            <p>
              Das Frontend dieser Anwendung wird als React-/Vite-Webanwendung bereitgestellt und kommuniziert mit einem extern
              gehosteten Backend unter der Domain spring-boot-production-8988.up.railway.app. Dabei können personenbezogene Daten
              an technische Dienstleister übermittelt werden, soweit dies für Hosting, API-Betrieb, Auslieferung und
              Systemsicherheit erforderlich ist.
            </p>
            <p className="mb-0">
              Werden externe Auftragsverarbeiter eingesetzt, erfolgt dies auf Grundlage geeigneter vertraglicher Regelungen.
              Soweit Übermittlungen in Drittländer stattfinden, müssen zusätzliche Garantien nach Art. 44 ff. DSGVO bestehen.
            </p>
          </section>

          <section>
            <h2 className="h5">5. Karten, externe Bibliotheken und Drittinhalte</h2>
            <p>
              Für Kartenfunktionen nutzt die Anwendung Leaflet. Die hierfür erforderlichen Leaflet-Ressourcen werden derzeit aus
              dem CDN unpkg.com geladen. Kartenkacheln werden von OpenStreetMap bereitgestellt. Beim Laden von Karten kann es
              daher technisch notwendig sein, dass Ihre IP-Adresse sowie Browser- und Verbindungsdaten an diese Anbieter
              übermittelt werden.
            </p>
            <p className="mb-0">
              Externe Karteninhalte werden nur geladen, wenn Kartenansichten innerhalb der Anwendung aufgerufen werden.
            </p>
          </section>

          <section>
            <h2 className="h5">6. Lokale Speicherung im Browser</h2>
            <p>
              Die Anwendung verwendet technisch erforderliche Einträge im Local Storage des Browsers. Dazu gehören insbesondere
              ein lokal gespeicherter JWT-Anmeldestatus sowie die Bestätigung des eingeblendeten Speicherhinweises.
            </p>
            <p className="mb-0">
              Diese Speicherung dient ausschließlich der sicheren und funktionsfähigen Bereitstellung der Anwendung. Eine
              Verwendung zu Marketing- oder Trackingzwecken findet nach aktuellem Stand nicht statt.
            </p>
          </section>

          <section>
            <h2 className="h5">7. Speicherdauer</h2>
            <p className="mb-0">
              Personenbezogene Daten werden nur so lange gespeichert, wie dies für die jeweiligen Verarbeitungszwecke,
              gesetzliche Aufbewahrungspflichten oder berechtigte Sicherheitsinteressen erforderlich ist. Lokal gespeicherte
              Sitzungsinformationen bleiben bis zur Abmeldung, zum Ablauf der Sitzung oder zur manuellen Löschung im Browser bestehen.
            </p>
          </section>

          <section>
            <h2 className="h5">8. Ihre Rechte</h2>
            <p>
              Betroffene Personen haben nach Maßgabe der gesetzlichen Voraussetzungen insbesondere folgende Rechte:
            </p>
            <ul className="mb-0">
              <li>Auskunft über verarbeitete personenbezogene Daten</li>
              <li>Berichtigung unrichtiger Daten</li>
              <li>Löschung oder Einschränkung der Verarbeitung</li>
              <li>Widerspruch gegen bestimmte Verarbeitungen</li>
              <li>Datenübertragbarkeit</li>
              <li>Beschwerde bei einer Datenschutzaufsichtsbehörde</li>
            </ul>
          </section>

          <section>
            <h2 className="h5">9. Datensicherheit</h2>
            <p>
              Es werden technische und organisatorische Maßnahmen eingesetzt, um Daten gegen Verlust, Manipulation,
              unberechtigten Zugriff und unbefugte Offenlegung zu schützen. Sicherheitsmaßnahmen werden fortlaufend an den
              Stand der Technik angepasst, soweit dies technisch und organisatorisch möglich ist.
            </p>
            <p className="mb-0">
              Geschützte Bereiche der Anwendung werden nur nach erfolgreicher Authentifizierung bereitgestellt. Ohne gültige
              Sitzung werden interne Verwaltungsansichten auf die Login-Seite umgeleitet.
            </p>
          </section>

          <section>
            <h2 className="h5">10. Stand und Aktualisierung</h2>
            <p className="mb-0">
              Diese Datenschutzerklärung wird bei Änderungen der Anwendung, der eingesetzten Dienste oder der rechtlichen
              Anforderungen aktualisiert.
            </p>
          </section>
        </div>
      </div>
    </div>
  </section>
);

export default PrivacyPage;