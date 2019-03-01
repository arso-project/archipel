# DemoDay Intro

## Volltext (3 min):

Wenn es darum geht private und geteilte web-Inhalte zu erhalten, dann hat die Vergangenheit deutlich gezeigt, dass zentralisierte Services ein Problem sind.  Platformen, Webseiten und Blogs kommen und gehen. Platformen, wie MySpace, Picasa, oder GeoCities waren groß und populär und gehören heute der Vergangenheit an. Die dort gespeichert Inhalte sind oft dauerhaft verloren gegangen. Diesem Problem sollte unserer Meinung nach mit Dezentralisierung begegnet werden und wir machen einen ersten Schritt in diese Richtung.

Wir entwicklen Archipel, ein Programm zur Archivierung und Veröffentlichung von Inhalten in einem Peer-To-Peer-Netzwerk. Inhalte können dabei Videos, Audios, Text, Bilder oder auch ganze Webseiten sein. Und dezentral heißt, dass es keinen zentralen Server gibt. Jeder kann sein eigener Server sein. Es gibt keinen Single-Point-of-Failure. Fällt ein Knoten im Netzwerk aus, bringt dies nicht das ganze System zum Zusammenbruch. Das mag weniger relevant sein für Unternehmen oder große Institutionen, die das Überdauern ihrer Inhalte selbst sicherstellen können. Doch wir haben vor Allem andere im Blick:

Einzelpersonen, kleine Initiativen oder temporäre Gruppen bringen oft mit viel Kreativität und Zeit Sammlungen an Inhalten hervor, sei es eine Materialsammlung zum NSU-Prozess, eine Sammlung von Kurzfilmen aus den 20er Jahren oder die Dokumentation einer Konferenz. Wir sehen solche Bemühungen als Teil einer Geschichtsschreibung von unten - und diese sollte dementsprechend erhalten werden. Das passiert oft mehr schlecht als recht. Vieles verschwindet oder schlummert in unzugänglichen Ecken des Internets. Mit Archipel wollen wir es möglich machen, dass daraus wieder lebendige Archive entstehen. Nicht nur kryptische Backups, sondern vernetzte und zeitgemäß zugängliche Mediensammlungen.

Wo stehen wir damit? Wir haben einen Prototypen! Archipel basiert auf dat, einem anderen Open-Source-Projekt. Damit haben wir eine solide Grundlage um Datenstrukturen mittels Peer-to-Peer zu vernetzen und auszutauschen. Bisher kann man mit Archipel Archive erstellen und diese mit Inhalten bestücken. Dies umfasst bisher vor Allem Dateien, aber bald wird es möglich sein ganze Websites zu importieren. Diese Inhalte können dann aufbereitet, also mit Metadaten wie Authoren, Beschreibungen oder Tags versehen werden. Texte und Medien können aus importierten Websites extrahiert werden. Anschließend können diese mit zeitgemäßen Interfaces zu durchforstet und betrachtet werden. Weiterhin planen wir eine Volltextsuche und einfache Möglichkeiten die Inhalte eines Archivs auf einer Website oder einem Blog zu veröffentlichen. 

Archipel läuft dabei entweder als Software auf meinem PC oder als Webapp auf einem Server. Mit letzterer werden Inhalte dann auch dauerhaft online gehalten. Entscheidend für den archivarischen Aspekt ist, dass es sehr leicht möglich ist, die erstellten Archive zwischen verschiedenen Knotenpunkten zu spiegeln. Die Kopien werden dabei automatisch synchron und up-to-date gehalten. Wenn ich etwas an meinem Archiv ändere, werden alle Kopien live aktualisiert.

Wie soll es weiter gehen? Der Prototypefund ist um, wir haben einen Prototypen - und werden weitermachen. Wir sind in regem Austausch mit potentiellen Nutzer*innen und der Open-Source-Community rund um das Dat-Projekt. Wer mitmachen möchte, uns auf erhaltenswerte Medienarchive hinweisen will, Ideen für eine Anschlussfinanzierung hat, oder einfach Hallo sagen möchte,  kann uns gerne an unserem Tisch besuchen oder sich per E-Mail melden. Wir sind überzeugt, dass es für eine Geschichte von unten gute Werkzeuge zur dezentralen Veröffentlichung und Archivierung braucht - und werden die nächsten Schritte gehen, gerne mit vielen weiteren Interessierten zusammen. Vielen Dank!















































## Stichpunkte


1. Wir entwickeln Archipel
2. Archipel: Dezentrale Archivierung und veröffenltichung von Inhalten
    - Inhalte: Audio, Video, Text, Bilder, Webseiten, ...
    - Dezentral: Kein zentraler Server. Jeder kann sein eigener Server sein. Stichwort Peer-to-Peer. (Sprung zum Intro)
        - Es gibt keine Single-Points-of-Failure. Wenn ein Knoten im Netzwerk ausfällt ist das nicht so schlimm.
        - Nicht sehr relevant für große Unternehmen und andere mit Geld etc. Aber für kleine Projekte mit beschränkten mitteln und lebensdauer. Wenn das Projekt/der Blog/o.ä. nicht mehr weiter betrieben wird sind die Änderungen bei anderen Peers vorhanden.
    - Archivierung
        - Grundsätzlich ein FileStorage mit zusätzlicher Vermetadatung und Suche.
        - Archive zu spiegeln ist sehr leicht. Spiegel: die eigene kopie eines archivs entspricht immer dem original.
        - Änderungen können auch bidirektionale gespiegelt werden. Ergo gemeinsam an einem Archiv arbeiten. (unverständlich)
    - Veröffentlichung
        - Es ist einfach möglich, eine Schnittstelle zwischen einer webseite oder einem blog und einem archiv zu erstellen, so dass die Archivierung und Veröffentlichung hand in hand geschehen.
    - Funktionsweise umreißen:
        - Wir bauen auf Dat auf, einem OpenSource toolset für p2p Datenstrukturen.
        <!-- - Die peers kommunizieren verschlüsselt. Es ist versioniert, append-only, vor nachträglichen veränderungen geschützt. -->
        <!-- - Diese Datenstrukturen kombinieren wir um Filesystem mit zusätzlichen Metadaten (und zukünftig Suchindices) zu erhalten. -->
        - Das ganze kann betrieben werden:
            - auf dem eigenen PC
            - auf einem kleinen mini storageServer im LAN
            - im Internet auf einem beliebigen Cloudserver
    - Wo stehen wir damit:
        - wir haben eine PROTOTYPEN (haha) und dieser kann:
            - geteilte Ordner wie bei Dropbox oder Nextcloud aber ohne Server
            - erste Ansätze zur Metadatenverwaltung.
            - Wiedergabe von Audio, Video, Bilder, Markdown, PDF
            - Gadgets: Wiki funktion und Youtube importer

Es gibt einige rauhe Ecken, aber es funktioniert. Wir sind im regen Austausch mit potenziellen Nutzerinnen und der opensource/dat community. Wir sind aktiv dabei weitere Fördermittel einzuwerben, wer was weiß melde sich gerne: archipel@riseup.net archipel.xyz

# noch gut:
- geschichte von unten
- living archives: die inhalte sind einfach wiederbelebbar.
