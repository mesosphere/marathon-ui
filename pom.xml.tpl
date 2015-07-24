<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>mesosphere.marathon</groupId>
  <artifactId>${PROJECT_ARTIFACT_ID}</artifactId>
  <version>${PROJECT_VERSION}</version>
  <packaging>jar</packaging>

  <name>${PROJECT_ARTIFACT_ID}</name>
  <url>http://maven.apache.org</url>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <distributionManagement>
    <repository>
        <id>aws-release</id>
        <name>AWS S3 Release Repository</name>
        <url>s3://downloads.mesosphere.io/maven</url>
    </repository>
    <snapshotRepository>
        <id>aws-snapshot</id>
        <name>AWS S3 Snapshot Repository</name>
        <url>s3://downloads.mesosphere.io/maven</url>
    </snapshotRepository>
</distributionManagement>

<build>
    <extensions>
      <extension>
        <groupId>org.springframework.build</groupId>
        <artifactId>aws-maven</artifactId>
        <version>5.0.0.RELEASE</version>
      </extension>
    </extensions>
  </build>
</project>
