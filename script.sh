javac -d bin -sourcepath src -cp "libs/weka.jar:libs/mysql-connector-java-5.0.8-bin.jar/:libs/org.json-20120521.jar/:libs/postgresql-9.3-1102.jdbc3.jar" src/boundaryExploitation/*.java src/mainPackage/*.java src/metrics/*.java src/configuration/*.java src/misclassifiedExploitation/*.java src/relevantObjectDiscovery/*.java src/User/*.java src/visualization/*.java src/Server/*.java
export CLASSPATH=libs/weka.jar:libs/org.json-20120521.jar:libs/postgresql-9.3-1102.jdbc3.jar:libs/mysql-connector-java-5.0.8-bin.jar:bin
java Server.DriverServer 8889 config.json
