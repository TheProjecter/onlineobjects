package dk.in2isoft.onlineobjects.core;

public class Pair<K,V> {

	private K key;
	private V value;
	
	public Pair(K key, V value) {
		super();
		this.key = key;
		this.value = value;
	}
	public void setKey(K key) {
		this.key = key;
	}
	public K getKey() {
		return key;
	}
	public void setValue(V value) {
		this.value = value;
	}
	public V getValue() {
		return value;
	}
}